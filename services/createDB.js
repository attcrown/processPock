const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

async function createDB(dbDir) {
    try {
        // สร้างไดเรกทอรีถ้าไม่อยู่
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        const dbPath = path.join(dbDir, 'dictionary.db');
        const db = new sqlite3.Database(dbPath);

        // สร้างตารางใหม่
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT
            )`);
        });

        // ปิดการเชื่อมต่อกับฐานข้อมูล
        db.close();
    } catch (error) {
        console.log('database error',error);
    }
}

module.exports = { createDB }