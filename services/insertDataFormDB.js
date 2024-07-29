const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

async function insertDataFromFile(dbDir, filePath ,fileNameDB) {
    try {
        const dbPath = path.join(dbDir, fileNameDB);
        const db = new sqlite3.Database(dbPath);

        // อ่านข้อมูลจากไฟล์
        const data = await fs.readFile(filePath, 'utf-8');
        const words = data.split('\n').map(word => word.toLowerCase().trim());

        // ใช้ Promise เพื่อทำให้การทำงานแบบ async เสร็จสมบูรณ์ก่อนปิดการเชื่อมต่อ
        await new Promise((resolve, reject) => {
            // เตรียมคำสั่ง SQL สำหรับการเพิ่มข้อมูล
            const stmt = db.prepare('INSERT INTO words (name) VALUES (?)');

            // เพิ่มข้อมูลลงในฐานข้อมูล
            words.forEach((word, index) => {
                stmt.run(word, (err) => {
                    if (err) reject(err);
                });
                console.log('add insert db:'+word)
            });

            // จบการเพิ่มข้อมูล
            stmt.finalize((err) => {
                if (err) reject(err);
                db.close((err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        });
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

module.exports = { insertDataFromFile };
