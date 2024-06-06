const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env.local') });

const deleteFolderRecursive = function(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        // remove directory after all of its contents have been removed
        fs.rmdirSync(directoryPath);
    }
};

const siteKeyword = process.env.SITE_KEYWORD;

console.log(process.env);

if (siteKeyword === 'mht') {
    deleteFolderRecursive('./src/app/cs');
  } else if (siteKeyword === 'cs') {
    deleteFolderRecursive('./src/app/mht');
  }
