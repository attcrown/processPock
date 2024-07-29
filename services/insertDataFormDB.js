const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

async function insertDataFromFile(dbDir, filePath) {
    try {
        const dbPath = path.join(dbDir, 'dictionary.db');
        const db = new sqlite3.Database(dbPath);

        // อ่านข้อมูลจากไฟล์
        const data = await fs.readFile(filePath, 'utf-8');
        const words = data.split('\n').map(word => word.toLowerCase().trim());

        // เตรียมคำสั่ง SQL สำหรับการเพิ่มข้อมูล
        const stmt = db.prepare('INSERT INTO words (name) VALUES (?)');

        // เพิ่มข้อมูลลงในฐานข้อมูล
        for (const word of words) {
            stmt.run(word);
        }

        // จบการเพิ่มข้อมูล
        stmt.finalize();

        // ปิดการเชื่อมต่อกับฐานข้อมูล
        db.close();
    } catch (error) {
        console.error(error);
    }
}

module.exports = { insertDataFromFile };
