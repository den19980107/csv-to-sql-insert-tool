const fs = require('fs');
const csv = require('csv-parser');
const SqlString = require('sqlstring-sqlite');

const tableName = "<replace to your database table name which you want to insert>"
const fileName = '<replace to your csv file name in csv_src folder>.csv';

let tableColsName;
let tableSchema;
let sqls = ""
let rownumber = 0
fs.createReadStream(`csv_src/${fileName}`)
    .pipe(csv())
    .on('data', (row) => {
        /**
         * 避免出現讀出來的 json 變成 key 上會帶雙引號導致讀不到這個 key 的問題
         * {
         *     "Key":"value",
         *     Key:"value"
         * }
         * 
         *  */
        const keys = Object.keys(row);
        const values = Object.values(row);
        const rowObj = {}
        for (let i = 0; i < keys.length; i++) {
            rowObj[`${keys[i].trim()}`] = values[i]
        }

        if (rownumber === 0) {
            tableColsName = Object.keys(row).join(',');
            tableSchema = tableColsName.split(",");
        }

        let sql = makeSqlInsert(rowObj)
        sqls += sql
        rownumber++;
    })
    .on('end', () => {
        fs.writeFile(`sql_dist/create_${tableName}.sql`, sqls, function (err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
        });
    });

const makeSqlInsert = (row) => {
    let values = ""
    tableSchema.forEach((col, index) => {
        // console.log(`${col}:${row[col]}`)
        if (isNaN(row[col]) && row[col] !== 'NULL') {
            console.log(row[col])
            values += `N${SqlString.escape(row[col])}`
        } else {
            values += row[col]
        }
        if (index != tableSchema.length - 1) {
            values += ","
        }
    })
    const sqlString = `insert into ${tableName} values(${values}); \n`

    return sqlString
}