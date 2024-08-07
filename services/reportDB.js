const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateReportDB (dataAns, outputPdfPath) {
    // สร้างเอกสาร PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPdfPath));

    // เขียนหัวเรื่อง
    doc.fontSize(16).text('Dictionary Report', { align: 'center' });
    doc.moveDown();

    // เขียนผลลัพธ์จาก dataAns ลงใน PDF
    doc.fontSize(12).text(`Total words with length > 5: ${dataAns.countWord}`);
    doc.moveDown();
    doc.fontSize(12).text(`Total words with repeating >=2 characters: ${dataAns.countWordRepeating}`);
    doc.moveDown();
    doc.fontSize(12).text(`Total words with same start and end character: ${dataAns.countWordSameStartEnd}`);
    doc.moveDown();

    // เขียนทุกคำลงใน PDF
    doc.fontSize(12).text('All words:');
    dataAns.capitalizeFirst.forEach(word => {
        doc.text(word.name);
    });

    doc.end();

    console.log('PDF file created successfully.');
}

module.exports = { generateReportDB };


