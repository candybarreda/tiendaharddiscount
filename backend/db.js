// backend/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE, // <- ¡Asegúrate que sea 'hard_discount' aquí!,
    port: +process.env.DB_PORT,
    options: {
        //instanceName: process.env.DB_INSTANCE_NAME,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        encrypt: process.env.DB_ENCRYPT === 'true',
    }
};

let pool;

    async function connectDb() {
        try {
            if (!pool || pool.closed) {
                pool = new sql.ConnectionPool(config);
                await pool.connect();
                console.log('Conectado a la base de datos SQL Server.');
            }
            return pool;
        } catch (err) {
            console.error('Error al conectar a la base de datos:', err);
            throw err;
        }
    }

async function executeProcedure(procedureName, params) {
    try {
        const pool = await connectDb();
        const request = pool.request();
        if (params) {
            for (const key in params) {
                request.input(key, params[key]);
            }
        }
        const result = await request.execute(procedureName);
        return result.recordset;
    } catch (err) {
        console.error(`Error al ejecutar el procedimiento ${procedureName}:`, err);
        throw err;
    }
}

async function executeQuery(query, params) {
    try {
        const pool = await connectDb();
        const request = pool.request();
        if (params) {
            for (const key in params) {
                request.input(key, params[key]);
            }
        }
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Error al ejecutar la consulta:`, err);
        throw err;
    }
}

module.exports = {
    connectDb,
    executeProcedure,
    executeQuery,
    sql
};