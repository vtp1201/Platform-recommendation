const sql = require('mssql');

//config 
module.exports = {
    connect: async function(config) {
        try {
            const result = await sql.connect(config);
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    disconnect: async function () {
        try {
            const result = await sql.close();
            console.log(result);
            return result;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    query: async function (query) {
        try {
            let sqlRequest = new sql.Request();
            const sqlQuery = `SELECT ${query.select} 
            FROM ${query.from} `;
            if (query.where) {
                query += `WHERE ${query.where}`;
            }
            const data = await sqlRequest.query(sqlQuery);
            console.log(data);
            return data;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}