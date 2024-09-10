/** Core dependencies */
import path from 'path';


/** Third party dependencies */
import axios from 'axios';
import { JSDOM } from 'jsdom';


/** Local declarations and assertions */
import fs from '../libs/fs-promisifed.lib';
import { processUrlOptionsType, processedUrlType } from './types/url-processor.type';


/**
 * Method for dowloading assets
 * @param assetUrl Asset URL
 * @param baseDir base directory to store asset to
 * @returns Local asset path
 */
export const downloadAsset = async (assetUrl: string, baseDir: string): Promise<string | null> => {
    try {
        const response = await axios.get(assetUrl, { responseType: 'arraybuffer' });
        const urlPath = new URL(assetUrl).pathname || '';
        const localPath = path.join(baseDir, urlPath);

        await fs.mkdir(path.dirname(localPath), { recursive: true });
        await fs.writeFile(localPath, response.data);

        return localPath;
    } catch (error) {
        console.error(`Failed to download asset: ${assetUrl}`, (error as any)?.message || error);
        return null;
    }
};


export const processUrl = async (url: string, options: processUrlOptionsType): Promise<processedUrlType> => {
    const { data } = await axios.get(url);

    const {
        assetsDir,
        metadataStore,
    } = options;

    const cleanUrl = url.replace(/https?:\/\//, '');

    await fs.mkdir(assetsDir, { recursive: true });
    await fs.mkdir(metadataStore, { recursive: true });

    // Parse HTML to find assets
    const useDom = new JSDOM(data);
    const document = useDom.window.document;

    const imageTagsFound = Array
        .from(document.querySelectorAll('img'))
        .map((img) => (img as HTMLImageElement).src);

    const styleSheetsFound = Array
        .from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((link) => (link as HTMLLinkElement).href);

    const scriptsFound = Array.from(document.querySelectorAll('script[src]'))
        .map((script) => (script as HTMLScriptElement).src);

    // Print metadata
    const numberOfLinksOnPage = document.querySelectorAll('a').length;
    const numberOfImagesOnPage = document.querySelectorAll('img').length;
    const lastFetched = new Date().toUTCString();

    // console.log(metadataStore);
    // const metadataStoreExists = await fs.exists(metadataStore);
    // if (!metadataStoreExists) {
    //     await fs.writeFile(metadataStore, '{}');
    // }

    const metadataFile = metadataStore.concat('/latest.json');
    try {
        var metaData = await import(metadataFile);
    } catch (exc) {
        console.log('Metadata file does not exist, creating one now...');
        await fs.writeFile(metadataFile, '{}');
    }
    metaData = { ...metaData };
    delete metaData.default;

    metaData[cleanUrl] = {
        url,
        numberOfLinksOnPage,
        numberOfImagesOnPage,
        lastFetched,
    };

    await fs.writeFile(metadataFile, JSON.stringify(metaData, null, 2));

    console.log(`site: ${cleanUrl}`);
    console.log(`links_count_on_page: ${numberOfLinksOnPage}`);
    console.log(`images_on_page: ${numberOfImagesOnPage}`);
    console.log(`last_fetched: ${lastFetched}`);

    const assets = [
        ...imageTagsFound,
        ...styleSheetsFound,
        ...scriptsFound,
    ];

    // Download assets and rewrite HTML
    await Promise.allSettled(
        assets
            .map(async assetUrl => {
                const useAssetUrl = url.concat(assetUrl);

                const localPath = await downloadAsset(useAssetUrl, assetsDir);

                if (localPath) {
                    const relativePath = path.relative(
                        path.join(assetsDir, '..'),
                        localPath
                    );

                    if (useAssetUrl.endsWith('css')) {
                        const linkTag = document.querySelector(`link[href="${assetUrl}"]`) as HTMLLinkElement;
                        linkTag!.href = relativePath;
                    } else if (useAssetUrl.endsWith('js')) {
                        const scriptTag = document.querySelector(`script[src="${assetUrl}"]`) as HTMLScriptElement;
                        scriptTag!.src = relativePath;
                    } else if (useAssetUrl.endsWith('png') || useAssetUrl.endsWith('jpg') || useAssetUrl.endsWith('jpeg') || useAssetUrl.endsWith('gif')) {
                        const imgTag = document.querySelector(`img[src="${assetUrl}"]`) as HTMLImageElement;
                        imgTag!.src = relativePath;
                    } else {
                        const linkTag = document.querySelector(`link[href="${assetUrl}"]`) as HTMLLinkElement;
                        linkTag!.href = relativePath;
                    }
                }
            })
    );

    /** Updating base */
    const previousBase = document.querySelector('base');
    if (previousBase) {
        /** Remove base tag if present */
        document.head.removeChild(previousBase);
    }
    const baseTag = document.createElement('base');
    baseTag.href = assetsDir;
    document.head.appendChild(baseTag);

    // Save modified HTML
    const htmlFilePath = path.join(assetsDir, `${cleanUrl}.html`);
    await fs.writeFile(htmlFilePath, useDom.serialize());

    return data;
};