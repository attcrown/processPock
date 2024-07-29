const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ฟังก์ชันสำหรับ query จำนวนคำที่มีความยาวมากกว่า 5 ตัวอักษร
async function countWordsLongerThanFive(dbDir) {
    const dbPath = path.join(dbDir, 'dictionary.db');
    const db = new sqlite3.Database(dbPath);
    const sql = 'SELECT COUNT(*) AS count FROM words WHERE LENGTH(name) > 5';
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query จำนวนคำที่มีตัวอักษรซ้ำในคำมากกว่าหรือเท่ากับ 2 ตัวอักษร
async function countWordsWithRepeatingCharacters(dbDir) {
    const dbPath = path.join(dbDir, 'dictionary.db');
    const db = new sqlite3.Database(dbPath);
    const sql = `
        SELECT COUNT(*) AS count FROM words
        WHERE (SELECT MAX(count) FROM
            (SELECT COUNT(*) AS count FROM
                (SELECT SUBSTR(name, pos, 1) AS char FROM words,
                (SELECT 1 AS pos UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10)
                WHERE pos <= LENGTH(name) AND words.name = words.name)
            GROUP BY char)
        ) >= 2
    `;
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query จำนวนคำที่ขึ้นต้นและลงท้ายด้วยตัวอักษรเดียวกัน
async function countWordsWithSameStartEnd(dbDir) {
    const dbPath = path.join(dbDir, 'dictionary.db');
    const db = new sqlite3.Database(dbPath);
    const sql = 'SELECT COUNT(*) AS count FROM words WHERE SUBSTR(name, 1, 1) = SUBSTR(name, -1, 1)';
    const count = await queryCount(db, sql);
    db.close();
    return count.count;
}

// ฟังก์ชันสำหรับ query ให้ตัวอักษรแรกของคำเป็นตัวพิมพ์ใหญ่
async function capitalizeFirstLetter(dbDir) {
    const dbPath = path.join(dbDir, 'dictionary.db');
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