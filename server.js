const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 3001;

// MySQL连接配置
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'campus_service',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 增强CORS配置
app.use(cors({
  origin: true, // 反射请求源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});
app.use(express.json());



// 初始化表结构并按需插入演示数据（避免每次重启清空数据）
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // 创建表（如果不存在）
        await connection.query(`
            CREATE TABLE IF NOT EXISTS lost_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type INT NOT NULL,
                goods_type VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                description TEXT,
                location VARCHAR(255),
                contact VARCHAR(255) NOT NULL,
                status INT DEFAULT 1,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 检查表是否为空
        const [rows] = await connection.query("SELECT COUNT(*) as cnt FROM lost_items");
        if (rows[0].cnt > 0) {
            console.log('数据库已存在数据，跳过初始化插入演示数据');
            connection.release();
            return;
        }

        // 插入演示数据
        const demoData = [
            [1, '证件', '', '【寻物】本人于6月10日下午3点左右在图书馆二楼电子阅览室丢失身份证一张。姓名：张明，身份证号：411************123。身份证外套有透明卡套，卡套上贴有蓝色星星贴纸。如有拾到者请速联系，必有重谢！联系电话：138****5678。', '图书馆二楼电子阅览室', '138****5678'],
            [2, '手机', '', '【招领】拾到iPhone 14 Pro Max手机一部，颜色为深空黑色，手机背面贴有卡通贴纸，屏幕有轻微划痕。手机壳为透明硅胶材质。拾取地点：第一食堂二楼靠窗位置。请失主描述锁屏密码或手机内特征以核实身份。联系电话：159****1234。', '第一食堂二楼', '159****1234'],
            [2, '钱包', '', '【招领】拾到黑色长款钱包一个，品牌为七匹狼，内含校园卡一张（姓名：王芳，学号：202311020101）、身份证一张、银行卡两张（建设银行、农业银行）及现金若干。拾取地点：体育馆看台第5排座椅下方。请失主描述现金大致金额及其他细节核实。', '体育馆看台', '188****9999'],
            [1, '钥匙', '', '【寻物】丢失钥匙串一串，共有5把钥匙，其中一把为蓝色门禁卡，一个银色U盘（金士顿32G）。U盘内有重要毕业论文资料，如有拾到者请尽快联系，万分感激！丢失地点：教学楼C座3楼至5楼之间。', '教学楼C座', '139****1111'],
            [2, '书本', '', '【招领】拾到《高等数学》教材一本，封面写有"李明"字样，内有笔记若干。拾于教学楼A座301教室。请失主描述书中具体内容核实。', '教学楼A座301', '155****2222'],
            [1, '手机', '', '【寻物】丢失华为P50手机一部，黑色，手机壳为深蓝色硅胶材质。丢失时间6月9日晚，地点在操场看台附近。手机内有重要资料，拾到请速联系。', '操场看台', '177****3333']
        ];

        for (const item of demoData) {
            await connection.query(
                "INSERT INTO lost_items (type, goods_type, title, description, location, contact) VALUES (?, ?, ?, ?, ?, ?)",
                item
            );
        }

        console.log('✅ 数据库初始化完成，共插入', demoData.length, '条演示数据');
        connection.release();
    } catch (err) {
        console.error('数据库初始化错误:', err);
    }
}

// 调用初始化函数
initializeDatabase();

// 创建 HTTP server 并挂载 socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('客户端连接: ', socket.id);
    socket.on('disconnect', () => {
        console.log('客户端断开: ', socket.id);
    });
});

// ========== API 接口 ==========

// 获取统计数据
app.get('/api/lost/stats', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [totalRows] = await connection.query("SELECT COUNT(*) as total FROM lost_items");
        const [lostRows] = await connection.query("SELECT COUNT(*) as lost FROM lost_items WHERE type = 1");
        const [foundRows] = await connection.query("SELECT COUNT(*) as found FROM lost_items WHERE type = 2");
        const [claimedRows] = await connection.query("SELECT COUNT(*) as claimed FROM lost_items WHERE status = 2");
        
        connection.release();
        
        res.json({
            code: 200,
            data: {
                total: totalRows[0].total || 0,
                lost: lostRows[0].lost || 0,
                found: foundRows[0].found || 0,
                claimed: claimedRows[0].claimed || 0
            }
        });
    } catch (err) {
        console.error('获取统计数据错误:', err);
        res.json({ code: 500, message: err.message });
    }
});

// 获取列表
app.get('/api/lost/list', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        let sql = "SELECT * FROM lost_items WHERE 1=1";
        const params = [];
        
        if (req.query.type && req.query.type !== 'all') {
            sql += " AND type = ?";
            params.push(req.query.type);
        }
        if (req.query.goods_type && req.query.goods_type !== '全部') {
            sql += " AND goods_type = ?";
            params.push(req.query.goods_type);
        }
        if (req.query.keyword) {
            sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
            const keyword = `%${req.query.keyword}%`;
            params.push(keyword, keyword, keyword);
        }
        
        sql += " ORDER BY create_time DESC";
        
        // 添加分页支持
        if (req.query.page && req.query.pageSize) {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;
            sql += ` LIMIT ${offset}, ${pageSize}`;
        }
        
        const [rows] = await connection.query(sql, params);
        connection.release();
        
        console.log('返回数据条数:', rows.length);
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json({ code: 200, data: rows });
    } catch (err) {
        console.error('查询错误:', err);
        res.json({ code: 500, message: err.message, data: [] });
    }
});

// 获取详情
app.get('/api/lost/detail/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM lost_items WHERE id = ?", [req.params.id]);
        connection.release();
        
        if (rows.length === 0) {
            res.json({ code: 404, message: '未找到该信息' });
            return;
        }
        
        console.log('返回详情 ID:', req.params.id);
        res.json({ code: 200, data: rows[0] });
    } catch (err) {
        console.error('查询详情错误:', err);
        res.json({ code: 500, message: err.message });
    }
});

// 发布信息
app.post('/api/lost/publish', async (req, res) => {
    const { type, goods_type, title, description, location, contact } = req.body;
    
    console.log('收到发布请求: origin=', req.headers.origin, 'user-agent=', req.headers['user-agent'], 'ip=', req.ip);
    console.log('请求体:', JSON.stringify(req.body, null, 2));
    
    // 验证必填项
    if (!type) {
        return res.json({ code: 400, message: '请选择信息类型' });
    }
    if (!goods_type) {
        return res.json({ code: 400, message: '请选择物品类型' });
    }
    if (!description || description.trim() === '') {
        return res.json({ code: 400, message: '请填写详细描述' });
    }
    if (!contact || contact.trim() === '') {
        return res.json({ code: 400, message: '请填写联系方式' });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            "INSERT INTO lost_items (type, goods_type, title, description, location, contact) VALUES (?, ?, ?, ?, ?, ?)",
            [type, goods_type, title || '', description, location || '', contact]
        );
        
        const newId = result.insertId;
        console.log('✅ 发布成功，ID:', newId);
        
        // 查询刚插入的记录并广播给所有客户端
        const [rows] = await connection.query("SELECT * FROM lost_items WHERE id = ?", [newId]);
        if (rows.length > 0) {
            io.emit('new_item', rows[0]);
        }
        
        connection.release();
        res.json({ code: 200, message: '发布成功', data: { id: newId } });
    } catch (err) {
        console.error('数据库错误:', err);
        res.json({ code: 500, message: err.message });
    }
});

// 认领信息（标记为已认领并广播）
app.post('/api/lost/claim', async (req, res) => {
    const { info_id, claim_contact, claim_reason } = req.body;
    console.log('收到认领请求:', { info_id, claim_contact, claim_reason });
    if (!info_id) return res.json({ code: 400, message: '缺少 info_id' });

    try {
        const connection = await pool.getConnection();
        
        // 更新状态
        await connection.query("UPDATE lost_items SET status = 2 WHERE id = ?", [info_id]);
        
        // 查询更新后的记录并广播
        const [rows] = await connection.query("SELECT * FROM lost_items WHERE id = ?", [info_id]);
        if (rows.length > 0) {
            io.emit('update_item', rows[0]);
        }
        
        connection.release();
        res.json({ code: 200, message: '认领处理完成' });
    } catch (err) {
        console.error('认领更新错误:', err);
        res.json({ code: 500, message: err.message });
    }
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║     ✅ 后端服务已启动                                      ║`);
    console.log(`║     📍 地址: http://localhost:${PORT}                      ║`);
    console.log(`║     📋 API: http://localhost:${PORT}/api/lost/list         ║`);
    console.log(`╚══════════════════════════════════════════════════════════╝\n`);
});