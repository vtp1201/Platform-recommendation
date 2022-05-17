const mysql = require('mysql2/promise');

module.exports = {
    testConnection: async function (config) {
        try {
            const result = await mysql.createConnection(config);
            await result.close();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    queryData: async function(config, query){
        try {
            const connection  = await mysql.createConnection(config);
            let queryString = `SELECT ${query.select} FROM ${query.from}`;
            if (query.where) {
                queryString += ` WHERE ${query.where}`;
            }
            const [rows, fields] = await connection.execute(queryString);
            await connection.close();
            return rows;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
} 