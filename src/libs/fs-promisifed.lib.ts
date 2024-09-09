/** Core dependencies */
import * as fsCore from 'fs';
import * as util from 'util';

export const fs = {
    writeFile: util.promisify(fsCore.writeFile),
    mkdir: util.promisify(fsCore.mkdir),
    exists: util.promisify(fsCore.exists),
}

export default fs;