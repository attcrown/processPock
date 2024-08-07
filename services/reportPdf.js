const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateReport(outputDir, reportDir, zipDir) {
    try {
        // สร้างเอกสาร PDF
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(reportDir);

        doc.pipe(writeStream);

        // เขียนหัวเรื่อง
        doc.fontSize(16).text('Folder Size Report', { align: 'center' });
        doc.moveDown();

        // คำนวณขนาดโฟลเดอร์หลัก
        const totalSize = await getFolderSize(outputDir);
        doc.fontSize(12).text(`Total size of the output folder: ${parseFloat(totalSize / 1024).toFixed(3)} KB`);
        doc.moveDown();

        // คำนวณขนาดโฟลเดอร์ย่อย
        const subfolders = await fs.readdir(outputDir);

        for (const folder of subfolders) {
            const folderPath = path.join(outputDir, folder);
            const stats = await fs.stat(folderPath);

            // ข้ามถ้าไม่ใช่โฟลเดอร์
            if (!stats.isDirectory()) {
                continue;
            }

            const sizeBefore = await getFolderSize(folderPath);

            // หาไฟล์ ZIP ที่ตรงกับชื่อโฟลเดอร์
            const zipFilePath = path.join(zipDir, `${folder}.zip`);
            let sizeAfter = 0;
            if (await fs.pathExists(zipFilePath)) {
                sizeAfter = await getFileSize(zipFilePath);
            }

            // คำนวณเปอร์เซ็นต์การลดขนาด
            const reduction = sizeBefore ? ((1 - (sizeAfter / sizeBefore)) * 100).toFixed(2) : 0;

            // เขียนข้อมูลขนาดลงใน PDF
            doc.fontSize(12).text(`Folder: ${folder}`);
            doc.fontSize(12).text(`  Before: Size of folder: ${parseFloat(sizeBefore / 1024).toFixed(3)} KB`);
            doc.fontSize(12).text(`  After: Size of zip file: ${parseFloat(sizeAfter / 1024).toFixed(3)} KB`);
            doc.fontSize(12).text(`  Reduction: ${reduction}%`);
            doc.moveDown();
        }

        doc.end();
        console.log('Report generated successfully.');
    } catch (err) {
        console.error('Error generating report:', err);
    }
}

async function getFolderSize(folderPath) {
    let totalSize = 0;

    // คำนวณขนาดของไฟล์และโฟลเดอร์ในโฟลเดอร์หลัก
    const items = await fs.readdir(folderPath);
    for (const item of items) {
        const itemPath = path.join(folderPath, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
            totalSize += await getFolderSize(itemPath);
        } else {
            totalSize += stats.size;
        }
    }
    return totalSize;
}

async function getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
}

// เรียกใช้ฟังก์ชัน
module.exports = { generateReport };
