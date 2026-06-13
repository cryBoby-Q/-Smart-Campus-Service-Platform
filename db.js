/**
 * 数据库配置文件
 */
const mysql = require('mysql2/promise');

// 使用环境变量以便本地调试/部署时灵活配置
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '123456';
const DB_NAME = process.env.DB_NAME || 'campus_service';

// 创建数据库连接池
const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接（打印完整错误栈以便排查）
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ 数据库连接成功');
        connection.release();
    } catch (error) {
        console.error('❌ 数据库连接失败:', error && error.stack ? error.stack : error);
    }
}

testConnection();

module.exports = pool;
