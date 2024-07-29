const fs = require('fs-extra');
async function readFileTxt(dir) {
    try {
        const data = await fs.readFile(dir, 'utf-8');
        return data
    } catch (err) {
        console.error(`Error reading file: ${err}`);
        return null
    }
}

module.exports = { readFileTxt }