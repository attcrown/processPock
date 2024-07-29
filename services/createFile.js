const fs = require('fs-extra');
const path = require('path');
async function createFile(word ,outputDir) {
    try {
        if(word.length === 1){
            const dir = path.join(outputDir, word[0]);
            await fs.ensureDir(dir)
        }else{
            const dir = path.join(outputDir, word[0], word[1]);
            await fs.ensureDir(dir)
        }
    } catch (error) {
        console.log('createFile',error);
        console.log(word);
    }
}

module.exports = { createFile }