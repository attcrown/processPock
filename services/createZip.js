const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

async function createZips(zipDir, outputDir) {
    try {
        await fs.ensureDir(zipDir);

        // อ่านชื่อโฟลเดอร์ทั้งหมดในไดเรคทอรี outputDir
        const folders = await fs.readdir(outputDir, { withFileTypes: true });
        const directories = folders.filter(folder => folder.isDirectory()).map(folder => folder.name);

        // สร้างไฟล์ ZIP พร้อมกัน
        for (const dir of directories) {
            const dirPath = path.join(outputDir, dir);
            const zipPath = path.join(zipDir, `${dir}.zip`);
            await createZip(dirPath, zipPath);
        }

        console.log('All ZIP files created successfully.');
    } catch (err) {
        console.error('Error:', err);
    }
}

function createZip(sourceDir, outputZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            // console.log(`ZIP file created: ${outputZipPath}`);
            resolve();
        });
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

module.exports = { createZips };
