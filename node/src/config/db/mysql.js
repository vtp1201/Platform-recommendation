const mysql = require('mysql2/promise');

module.exports = {
    testConnection: async function (config) {
        try {
            const result = await mysql.createConnection(config);
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
            const data = await connection.execute(queryString);
            console.log(data);
            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
} 