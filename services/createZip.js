const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

async function createZips(zipDir, outputDir) {
    try {
        await fs.ensureDir(zipDir);

        // อ่านชื่อโฟลเดอร์ทั้งหมดในไดเรคทอรี outputDir
        const folders = await fs.readdir(outputDir, { withFileTypes: true });
        const directories = folders.filter(folder => folder.isDirectory()).map(folder => folder.name);

        for (const dir of directories) {
            const dirPath = path.join(outputDir, dir);
            const zipPath = path.join(zipDir, `${dir}.zip`);
            // สร้างไฟล์ ZIP
            await createZip(dirPath, zipPath);
            console.log('create zip:'+dir+'.zip')
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

function createZip(sourceDir, outputZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

module.exports = { createZips };
