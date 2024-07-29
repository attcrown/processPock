const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateReport(outputDir,reportDir) {
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
        doc.fontSize(12).text(`Total size of the output folder: ${totalSize} bytes`);
        doc.moveDown();

        // คำนวณขนาดโฟลเดอร์ย่อย
        const subfolders = await fs.readdir(outputDir);
        for (const folder of subfolders) {
            const folderPath = path.join(outputDir, folder);
            const size = await getFolderSize(folderPath);
            doc.fontSize(12).text(`Size of folder ${folder}: ${size} bytes`);
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

// เรียกใช้ฟังก์ชัน
module.exports = { generateReport };
