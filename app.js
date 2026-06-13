/**
 * 校园跑腿模块 - 后端API主入口
 * 技术栈: Node.js + Express + MySQL
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./config/db');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================== 订单相关接口 ====================

/**
 * 1. 提交跑腿订单
 * POST /api/order/add
 */
app.post('/api/order/add', async (req, res) => {
    try {
        const { user_id, order_type, address, goods_info, price } = req.body;
        
        // 参数验证
        if (!order_type || !address || !goods_info) {
            return res.json({
                code: 400,
                msg: '缺少必要参数',
                data: null
            });
        }

        const sql = `
            INSERT INTO run_order (user_id, order_type, address, goods_info, price, status)
            VALUES (?, ?, ?, ?, ?, '待接单')
        `;
        
        const [result] = await pool.execute(sql, [user_id || 1, order_type, address, goods_info, price || 5]);
        
        res.json({
            code: 200,
            msg: '订单提交成功',
            data: {
                order_id: result.insertId
            }
        });
    } catch (error) {
        console.error('提交订单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 2. 查询个人订单列表
 * GET /api/order/list?user_id=1
 */
app.get('/api/order/list', async (req, res) => {
    try {
        const { user_id, status } = req.query;
        
        let sql = 'SELECT * FROM run_order WHERE user_id = ?';
        let params = [user_id || 1];
        
        if (status && status !== 'all') {
            sql += ' AND status = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY create_time DESC';
        
        const [rows] = await pool.execute(sql, params);
        
        res.json({
            code: 200,
            msg: '获取成功',
            data: rows
        });
    } catch (error) {
        console.error('查询订单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 3. 取消订单
 * POST /api/order/cancel
 */
app.post('/api/order/cancel', async (req, res) => {
    try {
        const { id } = req.body;
        
        const sql = 'UPDATE run_order SET status = ? WHERE id = ? AND status = ?';
        const [result] = await pool.execute(sql, ['已取消', id, '待接单']);
        
        if (result.affectedRows > 0) {
            res.json({
                code: 200,
                msg: '订单取消成功',
                data: null
            });
        } else {
            res.json({
                code: 400,
                msg: '订单无法取消',
                data: null
            });
        }
    } catch (error) {
        console.error('取消订单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

// ==================== 骑手相关接口 ====================

/**
 * 4. 获取待接单列表
 * GET /api/rider/pending
 */
app.get('/api/rider/pending', async (req, res) => {
    try {
        const sql = "SELECT * FROM run_order WHERE status = '待接单' ORDER BY create_time DESC";
        const [rows] = await pool.execute(sql);
        
        res.json({
            code: 200,
            msg: '获取成功',
            data: rows
        });
    } catch (error) {
        console.error('获取待接单列表错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 5. 骑手接单
 * POST /api/rider/receive
 */
app.post('/api/rider/receive', async (req, res) => {
    try {
        const { order_id, rider_id } = req.body;
        
        const sql = 'UPDATE run_order SET status = ?, rider_id = ? WHERE id = ? AND status = ?';
        const [result] = await pool.execute(sql, ['配送中', rider_id || 1, order_id, '待接单']);
        
        if (result.affectedRows > 0) {
            res.json({
                code: 200,
                msg: '接单成功',
                data: null
            });
        } else {
            res.json({
                code: 400,
                msg: '接单失败，订单可能已被接取',
                data: null
            });
        }
    } catch (error) {
        console.error('接单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 6. 获取骑手配送中订单
 * GET /api/rider/delivering?rider_id=1
 */
app.get('/api/rider/delivering', async (req, res) => {
    try {
        const { rider_id } = req.query;
        
        const sql = "SELECT * FROM run_order WHERE rider_id = ? AND status = '配送中' ORDER BY create_time DESC";
        const [rows] = await pool.execute(sql, [rider_id || 1]);
        
        res.json({
            code: 200,
            msg: '获取成功',
            data: rows
        });
    } catch (error) {
        console.error('获取配送中订单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 7. 确认送达/完成订单
 * POST /api/rider/complete
 */
app.post('/api/rider/complete', async (req, res) => {
    try {
        const { order_id } = req.body;
        
        const sql = 'UPDATE run_order SET status = ? WHERE id = ? AND status = ?';
        const [result] = await pool.execute(sql, ['已完成', order_id, '配送中']);
        
        if (result.affectedRows > 0) {
            res.json({
                code: 200,
                msg: '订单已完成',
                data: null
            });
        } else {
            res.json({
                code: 400,
                msg: '操作失败',
                data: null
            });
        }
    } catch (error) {
        console.error('完成订单错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

// ==================== 地址相关接口 ====================

/**
 * 8. 获取用户地址列表
 * GET /api/address/list?user_id=1
 */
app.get('/api/address/list', async (req, res) => {
    try {
        const { user_id } = req.query;
        
        const sql = 'SELECT * FROM run_address WHERE user_id = ? ORDER BY create_time DESC';
        const [rows] = await pool.execute(sql, [user_id || 1]);
        
        res.json({
            code: 200,
            msg: '获取成功',
            data: rows
        });
    } catch (error) {
        console.error('获取地址列表错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

/**
 * 9. 新增地址
 * POST /api/address/add
 */
app.post('/api/address/add', async (req, res) => {
    try {
        const { user_id, address_detail } = req.body;
        
        if (!address_detail) {
            return res.json({
                code: 400,
                msg: '地址不能为空',
                data: null
            });
        }
        
        const sql = 'INSERT INTO run_address (user_id, address_detail) VALUES (?, ?)';
        const [result] = await pool.execute(sql, [user_id || 1, address_detail]);
        
        res.json({
            code: 200,
            msg: '地址添加成功',
            data: {
                address_id: result.insertId
            }
        });
    } catch (error) {
        console.error('添加地址错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

// ==================== 骑手信息接口 ====================

/**
 * 10. 获取骑手列表
 * GET /api/rider/list
 */
app.get('/api/rider/list', async (req, res) => {
    try {
        const sql = 'SELECT * FROM run_rider ORDER BY status DESC, id ASC';
        const [rows] = await pool.execute(sql);
        
        res.json({
            code: 200,
            msg: '获取成功',
            data: rows
        });
    } catch (error) {
        console.error('获取骑手列表错误:', error);
        res.json({
            code: 500,
            msg: '服务器错误',
            data: null
        });
    }
});

// 根路由
app.get('/', (req, res) => {
    res.json({
        code: 200,
        msg: '校园跑腿模块API服务运行中',
        time: new Date().toLocaleString()
    });
});

// 启动服务
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 校园跑腿模块API服务已启动');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log('========================================');
    console.log('📋 接口列表:');
    console.log('  POST /api/order/add      - 提交订单');
    console.log('  GET  /api/order/list     - 订单列表');
    console.log('  POST /api/order/cancel   - 取消订单');
    console.log('  GET  /api/rider/pending  - 待接单列表');
    console.log('  POST /api/rider/receive  - 骑手接单');
    console.log('  GET  /api/rider/delivering - 配送中订单');
    console.log('  POST /api/rider/complete - 完成订单');
    console.log('  GET  /api/address/list   - 地址列表');
    console.log('  POST /api/address/add    - 新增地址');
    console.log('========================================');
});
