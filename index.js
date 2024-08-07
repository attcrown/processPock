const { readFileTxt } = require('./services/readFileTxt');
const { createFile } = require('./services/createFile');
const { writeFile } = require('./services/writeFile');
const { generateReport } = require('./services/reportPdf');
const { createZips } = require('./services/createZip');
const { createDB } = require('./services/createDB');
const { insertDataFromFile } = require('./services/insertDataFormDB');
const { generateReportDB } = require('./services/reportDB');
const {
    countWordsLongerThanFive ,
    countWordsWithRepeatingCharacters ,
    countWordsWithSameStartEnd ,
    capitalizeFirstLetter
} = require('./services/queryDB');

const path = require('path');

const fileNameDictionary = 'dictionary.txt';
const fileNameDB = 'dictionary.db';

const dictionaryPath = path.join(__dirname, fileNameDictionary);
const outputDir = path.join(__dirname, 'output');
const reportDir = path.join(__dirname, 'report.pdf');
const reportDBDir = path.join(__dirname, 'reportDB.pdf');
const zipDir = path.join(__dirname, 'zipped');
const dbDir = path.join(__dirname, 'db');

start();

async function start() {
    console.log('Starting application...');
    const start = Date.now();

    // read file text
    const data = await readFileTxt(dictionaryPath);
    console.log('Dictionary data loaded.');

    if(!data) return

    // generate words
    const words = data.split('\n').map(word => word.toLowerCase().trim());
    console.log(`Total words: ${words.length}`);

    // create output files & write files
    if(words.length <= 0) return
    for(const i in words){
        // not create file if word include 'a-z'
        if(/^[a-z]+$/.test(words[i])){
            //duo speed
            await createFile(words[i] ,outputDir);
            await writeFile(words[i] ,outputDir);
            // console.log('Created file:', words[i]);
        }
    }
    console.log('Files created successfully.');

    // generate zip files
    await createZips(zipDir ,outputDir);
    console.log('ZIP creation and report generation completed.');

    // generate report
    await generateReport(outputDir ,reportDir ,zipDir);

    // create database
    await createDB(dbDir ,fileNameDB);
    console.log('Database created successfully.');

    // insert database
    await insertDataFromFile(dbDir ,dictionaryPath ,fileNameDB);
    console.log('Data inserted successfully.');

    //query database
    const [countWord, countWordRepeating, countWordSameStartEnd ,capitalizeFirst] = await Promise.all([
        countWordsLongerThanFive(dbDir ,fileNameDB),
        countWordsWithRepeatingCharacters(dbDir ,fileNameDB),
        countWordsWithSameStartEnd(dbDir ,fileNameDB),
        capitalizeFirstLetter(dbDir ,fileNameDB),
    ]);
    const dataAns = {
        countWord,
        countWordRepeating,
        countWordSameStartEnd,
        capitalizeFirst
    };

    // generate report
    await generateReportDB(dataAns, reportDBDir);

    const end = Date.now();
    const ansTime = end - start;
    const ansTimeSec = ansTime / 1000;
    console.log('Time: ',ansTimeSec, 'sec');
    console.log('Application completed.');
}

