const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

async function insertDataFromFile(dbDir, filePath, fileNameDB) {
    try {
        const dbPath = path.join(dbDir, fileNameDB);
        const db = new sqlite3.Database(dbPath);

        // อ่านข้อมูลจากไฟล์
        const data = await fs.readFile(filePath, 'utf-8');
        const words = data.split('\n').map(word => word.toLowerCase().trim());

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // เตรียมคำสั่ง SQL สำหรับการเพิ่มข้อมูล
                const stmt = db.prepare('INSERT INTO words (name) VALUES (?)');

                for (const word of words) {
                    stmt.run(word, (err) => {
                        if (err) reject(err);
                    });
                }

                // จบการเพิ่มข้อมูล
                stmt.finalize((err) => {
                    if (err) reject(err);

                    db.run("COMMIT", (err) => {
                        if (err) reject(err);
                        db.close((err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error inserting data:', error);
    }
}

module.exports = { insertDataFromFile };
