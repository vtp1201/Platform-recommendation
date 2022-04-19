const sql = require('mssql');

//config 
module.exports = async function connect(config) {
    try {
        const result = await sql.connect(config);
        console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = async function disconnect() {
    try {
        const result = await sql.close();
        console.log(result);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = async function query(query) {
    try {
        let sqlRequest = new sql.Request();
        const sqlQuery = `SELECT ${query.select} 
        FROM ${query.from} WHERE ${query.where}`
        const data = await sqlRequest.query(sqlQuery);
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
        return false;
    }
}