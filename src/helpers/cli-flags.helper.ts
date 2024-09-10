/** Core dependencies */
import path from 'path';


const metadataStorePath = path.join(
    __dirname,
    '..',
    './metadata/latest.json'
)



/**
 * @param urls 
 * @returns 
 */
export const cliFlagsExtractor = (cliArguments: string[]) => {
    return cliArguments
        .filter((cliArgument, index) => {
            const isFlag = cliArgument.startsWith('--');
            if (isFlag)
                cliArguments.splice(index, 1);

            return isFlag;
        })
        .map(url => url.replace(/^--/, ''));
}


export const cliFlagsResolver = {
    'metadata': {
        resolver: async (url: string) => {
            const cleanUrl = url.replace(/https?:\/\//, '');
            try {
                var metadata = await import(metadataStorePath);
            } catch (exc) {
                console.error('Failed to import metadata', (exc as any)?.message);
            }
            return metadata?.[cleanUrl] || 'Not fetched yet - no metadata';         
        }
    }
}