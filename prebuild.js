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

const moveContentsRecursive = function(sourceDirectoryPath, destinationDirectoryPath) {
    if (fs.existsSync(sourceDirectoryPath)) {
        // Ensure the destination directory exists
        fs.mkdirSync(destinationDirectoryPath, { recursive: true });

        fs.readdirSync(sourceDirectoryPath).forEach((file) => {
            const currentPath = path.join(sourceDirectoryPath, file);
            const newPath = path.join(destinationDirectoryPath, file);
            
            if (fs.lstatSync(currentPath).isDirectory()) { // recurse
                moveContentsRecursive(currentPath, newPath);
                // remove the now-empty source directory
                fs.rmdirSync(currentPath, { recursive: true });
            } else { // move file
                // Ensure the parent directory of the new path exists
                fs.mkdirSync(path.dirname(newPath), { recursive: true });

                try {
                    fs.renameSync(currentPath, newPath); // move file
                } catch (error) { 
                   console.error("Error renaming "+currentPath+' to '+newPath)
                }
            }
        });
    }
};

const removeFile = function(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`File removed: ${filePath}`);
        } catch (error) {
            console.error(`Error removing the file: ${filePath}`, error);
        }
    }
};

if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'){
    console.log("Skipping prebuild -- not on production environment")
    return
}

removeFile(path.join(__dirname, 'src', 'app', 'page.js'));

const siteKeyword = process.env.SITE_KEYWORD;

if (siteKeyword === 'mht') {
    deleteFolderRecursive('./src/app/cs');
    moveContentsRecursive('./src/app/mht', './src/app');

    deleteFolderRecursive('./public/cs');
    moveContentsRecursive('./public/mht', './public');

  } else if (siteKeyword === 'cs') {
    deleteFolderRecursive('./src/app/mht');
    moveContentsRecursive('./src/app/cs', './src/app');

    deleteFolderRecursive('./public/mht');
    moveContentsRecursive('./public/cs', './public');
}
