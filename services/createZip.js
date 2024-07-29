const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

async function createZipsAndReport(zipDir, outputDir, reportDir) {
    try {
        await fs.ensureDir(zipDir);

        // อ่านชื่อโฟลเดอร์ทั้งหมดในไดเรคทอรี outputDir
        const folders = await fs.readdir(outputDir, { withFileTypes: true });
        const directories = folders.filter(folder => folder.isDirectory()).map(folder => folder.name);

        let reportContent = '';

        for (const dir of directories) {
            const dirPath = path.join(outputDir, dir);
            const zipPath = path.join(zipDir, `${dir}.zip`);

            // ขนาดก่อนบีบอัด
            const originalSize = await getFolderSize(dirPath);

            // สร้างไฟล์ ZIP
            await createZip(dirPath, zipPath);

            // ขนาดหลังบีบอัด
            const zippedSize = (await fs.stat(zipPath)).size;

            // คำนวณเปอร์เซ็นต์การบีบอัด
            const percentageReduction = ((1 - (zippedSize / originalSize)) * 100).toFixed(2);

            reportContent += `Folder: ${dir}\nOriginal Size: ${originalSize} bytes\nZipped Size: ${zippedSize} bytes\nReduction: ${percentageReduction}%\n\n`;
        }

        // เขียนรายงานลงไฟล์
        await fs.writeFile(reportDir, reportContent);
        console.log('ZIP creation and report generation completed.');
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

async function getFolderSize(dirPath) {
    const files = await fs.readdir(dirPath);
    const fileStats = await Promise.all(files.map(file => fs.stat(path.join(dirPath, file))));
    const totalSize = fileStats.reduce((acc, stat) => acc + stat.size, 0);
    return totalSize;
}

module.exports = { createZipsAndReport };
