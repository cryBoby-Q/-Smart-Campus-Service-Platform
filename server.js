const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../page')));

// MySQL数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',  // 修改为你的数据库密码
    database: 'campus_secondhand'  // 修改为你的数据库名
});

db.connect(err => {
    if (err) {
        console.error('MySQL数据库连接失败！', err);
        return;
    }
    console.log('MySQL数据库连接成功！');
});

// ==================== 根路径重定向 ====================
app.get('/', (req, res) => {
    res.redirect('/second/index.html');
});

// ==================== 商品相关 API ====================

// 获取商品列表
app.get('/api/goods/list', (req, res) => {
    const { type, keyword } = req.query;
    let sql = `SELECT * FROM goods WHERE status = '上架'`;
    const params = [];
    
    if (type && type !== '') {
        sql += ` AND type = ?`;
        params.push(type);
    }
    if (keyword && keyword !== '') {
        sql += ` AND title LIKE ?`;
        params.push(`%${keyword}%`);
    }
    
    sql += ` ORDER BY create_time DESC`;
    
    db.query(sql, params, (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

// 获取商品详情
app.get('/api/goods/detail', (req, res) => {
    const { id } = req.query;
    const sql = `SELECT * FROM goods WHERE id = ?`;
    db.query(sql, [id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data[0] || null });
    });
});

// 发布商品
app.post('/api/goods/publish', (req, res) => {
    const { user_id, title, type, price, content, img, status } = req.body;
    const sql = `INSERT INTO goods (user_id, title, type, price, content, img, status, create_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
    db.query(sql, [user_id, title, type, price, content, img, status], (err, result) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: { id: result.insertId } });
    });
});

// 获取我的发布
app.get('/api/goods/my', (req, res) => {
    const { user_id } = req.query;
    const sql = `SELECT * FROM goods WHERE user_id = ? ORDER BY create_time DESC`;
    db.query(sql, [user_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

// 修改商品状态
app.post('/api/goods/status', (req, res) => {
    const { id, status } = req.body;
    const sql = `UPDATE goods SET status = ? WHERE id = ?`;
    db.query(sql, [status, id], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

// 删除商品
app.post('/api/goods/delete', (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.json({ success: false, message: '缺少商品ID' });
    }
    
    db.query('DELETE FROM collect WHERE goods_id = ?', [id], (err) => {
        if (err) console.error('删除收藏失败:', err);
        db.query('DELETE FROM message WHERE goods_id = ?', [id], (err) => {
            if (err) console.error('删除留言失败:', err);
            db.query('DELETE FROM cart WHERE goods_id = ?', [id], (err) => {
                if (err) console.error('删除购物车失败:', err);
                db.query('DELETE FROM goods WHERE id = ?', [id], (err, result) => {
                    if (err) {
                        return res.json({ success: false, message: err.message });
                    }
                    if (result.affectedRows === 0) {
                        return res.json({ success: false, message: '商品不存在' });
                    }
                    res.json({ success: true, message: '删除成功' });
                });
            });
        });
    });
});

// ==================== 收藏相关 API ====================

app.get('/api/collect/check', (req, res) => {
    const { user_id, goods_id } = req.query;
    const sql = `SELECT * FROM collect WHERE user_id = ? AND goods_id = ?`;
    db.query(sql, [user_id, goods_id], (err, data) => {
        if (err) {
            return res.json({ success: false, data: false });
        }
        res.json({ success: true, data: data.length > 0 });
    });
});

app.post('/api/collect/add', (req, res) => {
    const { user_id, goods_id } = req.body;
    const sql = `INSERT INTO collect (user_id, goods_id, create_time) VALUES (?, ?, NOW())`;
    db.query(sql, [user_id, goods_id], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

app.post('/api/collect/cancel', (req, res) => {
    const { user_id, goods_id } = req.body;
    const sql = `DELETE FROM collect WHERE user_id = ? AND goods_id = ?`;
    db.query(sql, [user_id, goods_id], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

app.get('/api/collect/my', (req, res) => {
    const { user_id } = req.query;
    const sql = `SELECT c.id, c.goods_id, g.title, g.type, g.price, g.img 
                 FROM collect c 
                 LEFT JOIN goods g ON c.goods_id = g.id 
                 WHERE c.user_id = ? 
                 ORDER BY c.create_time DESC`;
    db.query(sql, [user_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

// ==================== 留言相关 API ====================

app.get('/api/msg/list', (req, res) => {
    const { goods_id } = req.query;
    const sql = `SELECT * FROM message WHERE goods_id = ? ORDER BY msg_time ASC`;
    db.query(sql, [goods_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

app.post('/api/msg/send', (req, res) => {
    const { goods_id, from_user_id, content } = req.body;
    const sql = `INSERT INTO message (goods_id, from_user_id, content, msg_time) VALUES (?, ?, ?, NOW())`;
    db.query(sql, [goods_id, from_user_id, content], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

// ==================== 购物车 API ====================

app.post('/api/cart/add', (req, res) => {
    const { user_id, goods_id, quantity = 1 } = req.body;
    
    if (!user_id || !goods_id) {
        return res.json({ success: false, message: '参数错误' });
    }
    
    const sql = `INSERT INTO cart (user_id, goods_id, quantity, create_time) 
                 VALUES (?, ?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE quantity = quantity + ?`;
    
    db.query(sql, [user_id, goods_id, quantity, quantity], (err, result) => {
        if (err) {
            console.error('购物车添加失败:', err);
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '添加成功' });
    });
});

app.get('/api/cart/list', (req, res) => {
    const { user_id } = req.query;
    
    if (!user_id) {
        return res.json({ success: false, message: '缺少用户ID' });
    }
    
    const sql = `SELECT c.id, c.user_id, c.goods_id, c.quantity, c.create_time,
                        g.title, g.price, g.img, g.type
                 FROM cart c 
                 LEFT JOIN goods g ON c.goods_id = g.id 
                 WHERE c.user_id = ? 
                 ORDER BY c.create_time DESC`;
    
    db.query(sql, [user_id], (err, data) => {
        if (err) {
            console.error('获取购物车失败:', err);
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

app.post('/api/cart/update', (req, res) => {
    const { user_id, goods_id, quantity } = req.body;
    
    if (!user_id || !goods_id || quantity === undefined) {
        return res.json({ success: false, message: '参数错误' });
    }
    
    if (quantity <= 0) {
        const delSql = `DELETE FROM cart WHERE user_id = ? AND goods_id = ?`;
        db.query(delSql, [user_id, goods_id], (err) => {
            res.json({ success: !err });
        });
    } else {
        const sql = `UPDATE cart SET quantity = ? WHERE user_id = ? AND goods_id = ?`;
        db.query(sql, [quantity, user_id, goods_id], (err) => {
            res.json({ success: !err });
        });
    }
});

app.post('/api/cart/remove', (req, res) => {
    const { user_id, goods_id } = req.body;
    
    const sql = `DELETE FROM cart WHERE user_id = ? AND goods_id = ?`;
    db.query(sql, [user_id, goods_id], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '删除成功' });
    });
});

app.post('/api/cart/clear', (req, res) => {
    const { user_id } = req.body;
    
    const sql = `DELETE FROM cart WHERE user_id = ?`;
    db.query(sql, [user_id], (err) => {
        res.json({ success: !err });
    });
});

// ==================== 订单 API ====================

// 生成订单号
function generateOrderNo() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${year}${month}${day}${hour}${minute}${second}${random}`;
}

// 创建订单
app.post('/api/order/create', (req, res) => {
    const { user_id, receiver_name, receiver_phone, receiver_address, remark } = req.body;
    
    if (!user_id) {
        return res.json({ success: false, message: '用户ID不能为空' });
    }
    
    const cartSql = `SELECT c.goods_id, c.quantity, g.title, g.price 
                     FROM cart c 
                     LEFT JOIN goods g ON c.goods_id = g.id 
                     WHERE c.user_id = ?`;
    
    db.query(cartSql, [user_id], (err, cartItems) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        
        if (cartItems.length === 0) {
            return res.json({ success: false, message: '购物车是空的' });
        }
        
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });
        
        const orderNo = generateOrderNo();
        
        const orderSql = `INSERT INTO orders (order_no, user_id, total_amount, status, receiver_name, receiver_phone, receiver_address, remark, create_time) 
                          VALUES (?, ?, ?, '待付款', ?, ?, ?, ?, NOW())`;
        
        db.query(orderSql, [orderNo, user_id, totalAmount, receiver_name, receiver_phone, receiver_address, remark], (err, result) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            }
            
            const orderId = result.insertId;
            
            const itemSql = `INSERT INTO order_items (order_id, goods_id, goods_title, goods_price, quantity, total_price) VALUES ?`;
            const itemValues = cartItems.map(item => [
                orderId, 
                item.goods_id, 
                item.title, 
                item.price, 
                item.quantity, 
                item.price * item.quantity
            ]);
            
            db.query(itemSql, [itemValues], (err) => {
                if (err) {
                    return res.json({ success: false, message: err.message });
                }
                
                db.query('DELETE FROM cart WHERE user_id = ?', [user_id], () => {
                    res.json({ 
                        success: true, 
                        data: { orderId: orderId, orderNo: orderNo, totalAmount: totalAmount },
                        message: '订单创建成功'
                    });
                });
            });
        });
    });
});

// 获取订单列表
app.get('/api/order/list', (req, res) => {
    const { user_id } = req.query;
    
    const sql = `SELECT * FROM orders WHERE user_id = ? ORDER BY create_time DESC`;
    db.query(sql, [user_id], (err, data) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, data: data });
    });
});

// 获取订单详情
app.get('/api/order/detail', (req, res) => {
    const { order_id } = req.query;
    
    const orderSql = `SELECT * FROM orders WHERE id = ?`;
    db.query(orderSql, [order_id], (err, orderData) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        
        const itemsSql = `SELECT * FROM order_items WHERE order_id = ?`;
        db.query(itemsSql, [order_id], (err, itemsData) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            }
            res.json({ success: true, data: { order: orderData[0], items: itemsData } });
        });
    });
});

// 更新订单状态
app.post('/api/order/status', (req, res) => {
    const { order_id, status } = req.body;
    
    let updateTime = '';
    if (status === '已付款') {
        updateTime = ', pay_time = NOW()';
    } else if (status === '已完成') {
        updateTime = ', complete_time = NOW()';
    }
    
    const sql = `UPDATE orders SET status = ?${updateTime} WHERE id = ?`;
    db.query(sql, [status, order_id], (err) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: '状态更新成功' });
    });
});

// 取消订单
app.post('/api/order/cancel', (req, res) => {
    const { order_id } = req.body;
    
    const sql = `UPDATE orders SET status = '已取消' WHERE id = ? AND status = '待付款'`;
    db.query(sql, [order_id], (err, result) => {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: '只能取消待付款的订单' });
        }
        res.json({ success: true, message: '订单已取消' });
    });
});

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     🎓 校园二手交易平台服务已启动！                        ║
║                                                          ║
║     服务地址：http://localhost:${PORT}                     ║
║     首页访问：http://localhost:${PORT}/second/index.html    ║
║                                                          ║
║     前端页面列表：                                         ║
║     - 首页：http://localhost:${PORT}/second/index.html      ║
║     - 发布页：http://localhost:${PORT}/second/publish.html  ║
║     - 我的发布：http://localhost:${PORT}/second/my_publish.html ║
║     - 我的收藏：http://localhost:${PORT}/second/my_collect.html ║
║     - 我的订单：http://localhost:${PORT}/second/my_order.html ║
║     - 详情页：http://localhost:${PORT}/second/goods_detail.html?id=1 ║
╚════════════════════════════════════════════════════════════╝
    `);
});