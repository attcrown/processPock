const fs = require('fs-extra');
const path = require('path');

async function writeFile(word ,outputDir) {
    try {
        const content = (word + '\n').repeat(100);
        if(word.length === 1){
            const filePath = path.join(outputDir, word[0], `${word}.txt`);
            await fs.writeFile(filePath, content, 'utf-8');
        }else{
            const filePath = path.join(outputDir, word[0], word[1] ,`${word}.txt`);
            await fs.writeFile(filePath, content, 'utf-8');
        }
    } catch (error) {
        console.log('writeFile',error);
        console.log(word);
    }
}

module.exports = { writeFile }