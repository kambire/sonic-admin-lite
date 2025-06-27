
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'sonic_admin',
  password: process.env.DB_PASS || 'SonicAdmin2024!',
  database: process.env.DB_NAME || 'sonic_admin',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

let pool;

const createPool = () => {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000
  });
  
  console.log('✅ MySQL connection pool created');
  return pool;
};

const getConnection = async () => {
  if (!pool) {
    createPool();
  }
  return await pool.getConnection();
};

const query = async (sql, params = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

module.exports = {
  createPool,
  getConnection,
  query,
  pool: () => pool
};
