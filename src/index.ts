#!/usr/bin/env ts-node

/** Core dependencies */
import { argv } from 'process';
import path from 'path';


/** Local dependencies and declarations */
import { processUrl } from './processors/url-processor.processor';
import { cliFlagsResolver, cliFlagsExtractor } from './helpers/cli-flags.helper';
import fs from './libs/fs-promisifed.lib';

const extractionDirectory = './extracted';
const metadataStoreDirectory = './metadata'


/** Process flow */
const [...urls] = argv.slice(2);

/** 
 * @description Extracting flags from arguments
 * @note Flags that we are using do not have any short form for now, optimizations and enhancements could be done
 * to allow so.
 * @note Avaliable flags:
 * 1. --metadata
 */
const flags = cliFlagsExtractor(urls);


/** 
 * Main ETL function
 * @returns {Promise<void>}
 * */
const main = async () => {
    try {
        const responses = await Promise.allSettled(
            urls.map(async url => {

                /**
                 * Actions for metadata flag
                 */
                if (flags.includes('metadata')) {
                    const metaFile = metadataStoreDirectory.concat('/latest.json');

                    if (!await fs.exists(metaFile)) {
                        await fs.mkdir(metadataStoreDirectory, { recursive: true });
                        await fs.writeFile(metaFile, '{}');
                    }

                    const metadatas = await Promise.all(
                        urls.map(async url => {
                            const metadata = await cliFlagsResolver.metadata.resolver(url);
                            return { metadata, url };
                        })
                    )

                    for (let metadata of metadatas) {
                        console.log(`\n--------- URL: ${metadata.url} ---------`);
                        console.log(metadata);
                    }

                    process.exit(0);
                }

                /**
                 * Normal ETL flow
                 */
                const assetsDir = path.join(__dirname, extractionDirectory);
                const metadataStore = path.join(__dirname, metadataStoreDirectory);


                const data = await processUrl(
                    url,
                    {
                        assetsDir,
                        metadataStore,
                    });

                return data;
            })
        );
        responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Successfully fetched and saved: ${urls[index]}`);
            } else {
                console.error(`Failed to fetch: ${urls[index]}:\n`, result.reason);
            }
        });
    } catch (exc) {
        console.log((exc as any)?.message ?? exc);
        return 1;
    }
}

main();
