const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

async function createDB(dbDir ,fileNameDB) {
    try {
        // สร้างไดเรกทอรีถ้าไม่อยู่
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        const dbPath = path.join(dbDir, fileNameDB);

        // ลบฐานข้อมูลเดิมถ้ามีอยู่
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
        
        // สร้าง Promise สำหรับการทำงานกับฐานข้อมูล
        const db = new sqlite3.Database(dbPath);

        // สร้างตารางใหม่
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS words (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT
                )`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });

        // ปิดการเชื่อมต่อกับฐานข้อมูล
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err);
            }
        });

        console.log('Database and table created successfully.');
    } catch (error) {
        console.error('Database error:', error);
    }
}

module.exports = { createDB };
