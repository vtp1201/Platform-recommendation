const { Client } = require('pg')

module.exports = {
    testConnectionPG: async function (config) {
        try {
            const client = new Client(config)
            await client.connect();
            await client.end();
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    queryDataPG: async function(config, query){
        try {
            const client = new Client(config)
            let queryString = `SELECT ${query.select} FROM ${query.from}`;
            if (query.where) {
                queryString += ` WHERE ${query.where}`;
            }
            const rows = await client.query(queryString);
            await client.end();
            return rows;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
} 