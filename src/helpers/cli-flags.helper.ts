/** Core dependencies */
import path from 'path';


const metadataStorePath = path.join(
    __dirname,
    '..',
    'metadata.json'
)


export const cliFlags = {
    'metadata': {
        reslover: async (url: string) => {
            const cleanUrl = url.replace(/https?:\/\//, '');
            const metadata = await import(metadataStorePath);
            return metadata[cleanUrl] || 'Not fetched yet - no metadata';         
        }
    }
}