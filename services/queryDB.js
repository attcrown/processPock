const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ฟังก์ชันสำหรับ query จำนวนคำที่มีความยาวมากกว่า 5 ตัวอักษร
async function countWordsLongerThanFive(dbDir,fileNameDB) {
    const dbPath = path.join(dbDir, fileNameDB);
    const db = new sqlite3.Database(dbPath);
    const sql = 'SELECT COUNT(*) AS count FROM words WHERE LENGTH(name) > 5';
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query จำนวนคำที่มีตัวอักษรซ้ำในคำมากกว่าหรือเท่ากับ 2 ตัวอักษร
async function countWordsWithRepeatingCharacters(dbDir, fileNameDB) {
    const dbPath = path.join(dbDir, fileNameDB);
    const db = new sqlite3.Database(dbPath);
    const sql = `
        SELECT COUNT(*) AS count FROM words
        WHERE EXISTS (
            SELECT 1 FROM (
                WITH RECURSIVE seq AS (
                    SELECT 1 AS pos
                    UNION ALL
                    SELECT pos + 1 FROM seq
                    WHERE pos < (SELECT MAX(LENGTH(name)) FROM words)
                )
                SELECT name, SUBSTR(name, seq.pos, 1) AS char, COUNT(*) AS char_count
                FROM words, seq
                WHERE seq.pos <= LENGTH(name)
                GROUP BY name, char
                HAVING char_count >= 2
            ) AS char_counts
            WHERE words.name = char_counts.name
        )
    `;
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query จำนวนคำที่ขึ้นต้นและลงท้ายด้วยตัวอักษรเดียวกัน
async function countWordsWithSameStartEnd(dbDir,fileNameDB) {
    const dbPath = path.join(dbDir, fileNameDB);
    const db = new sqlite3.Database(dbPath);
    const sql = 'SELECT COUNT(*) AS count FROM words WHERE SUBSTR(name, 1, 1) = SUBSTR(name, -1, 1)';
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query ให้ตัวอักษรแรกของคำเป็นตัวพิมพ์ใหญ่
async function capitalizeFirstLetter(dbDir,fileNameDB) {
    const dbPath = path.join(dbDir, fileNameDB);
    const db = new sqlite3.Database(dbPath);
    const sql = `UPDATE words SET name = UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2))`;
    await queryCount(db, sql);
    const count = await queryAll(db, 'SELECT * FROM words');
    db.close();
    return count;
}

// ฟังก์ชันสำหรับ query
async function queryCount(db, sql) {
    return new Promise((resolve, reject) => {
        db.get(sql, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function queryAll(db, sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = {
    countWordsLongerThanFive ,
    countWordsWithRepeatingCharacters ,
    countWordsWithSameStartEnd ,
    capitalizeFirstLetter
}