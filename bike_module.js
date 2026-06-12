const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');

function createBikeModule(options = {}) {
  const router = express.Router();
  const publicPath = options.publicPath || path.join(__dirname, '..', 'page');
  const apiPaths = options.apiPaths || ['/api/bike_api.js', '/api/bike_api.php'];

  const pool = mysql.createPool({
    host: options.dbHost || '127.0.0.1',
    user: options.dbUser || 'root',
    password: options.dbPassword || '123456',
    database: options.dbName || 'campus_service',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  router.use(express.static(publicPath));

  router.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'bike', 'index.html'));
  });

  router.get(apiPaths, async (req, res) => {
    console.log('GET', req.path, req.query);
    const action = req.query.action || '';
    if (!action) {
      return res.sendFile(path.join(publicPath, 'bike', 'index.html'));
    }
    try {
      switch (action) {
        case 'list_bikes':
          return listBikes(pool, req, res);
        case 'list_orders':
          return listOrders(pool, req, res);
        case 'list_records':
          return listRecords(pool, req, res);
        default:
          return res.status(400).json({ success: false, message: '无效的 action 参数' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  router.post(apiPaths, async (req, res) => {
    console.log('POST', req.path, req.query, 'body=', req.body);
    const action = req.query.action || '';
    try {
      switch (action) {
        case 'borrow_bike':
          return borrowBike(pool, req, res);
        case 'pay_order':
          return payOrder(pool, req, res);
        case 'return_bike':
          return returnBike(pool, req, res);
        case 'report_repair':
          return reportRepair(pool, req, res);
        default:
          return res.status(400).json({ success: false, message: '无效的 action 参数' });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
}

async function listBikes(pool, req, res) {
  const position = req.query.position || '';
  let sql = 'SELECT id, bike_no, position, status FROM bike_info';
  const params = [];
  if (position) {
    sql += ' WHERE position = ?';
    params.push(position);
  }
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, bikes: rows });
}

async function listRecords(pool, req, res) {
  const userId = parseInt(req.query.user_id, 10) || 0;
  if (!userId) {
    return res.json({ success: false, message: 'user_id 为必填项' });
  }
  const [rows] = await pool.query(
    'SELECT r.id, r.bike_id, b.bike_no, r.borrow_time, r.return_time, r.duration FROM bike_record r JOIN bike_info b ON r.bike_id = b.id WHERE r.user_id = ? ORDER BY r.borrow_time DESC',
    [userId]
  );
  res.json({ success: true, records: rows });
}

async function borrowBike(pool, req, res) {
  const userId = parseInt(req.body.user_id, 10) || 0;
  const bikeId = parseInt(req.body.bike_id, 10) || 0;
  if (!userId || !bikeId) {
    return res.json({ success: false, message: 'user_id 和 bike_id 为必填项' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT status FROM bike_info WHERE id = ? FOR UPDATE', [bikeId]);
    const bike = rows[0];
    if (!bike) {
      throw new Error('未找到该单车');
    }
    if (bike.status !== '可借用') {
      throw new Error('该单车当前不可借用');
    }
    const now = new Date();
    const borrowTime = now.toISOString().slice(0, 19).replace('T', ' ');
    await conn.query('UPDATE bike_info SET status = ? WHERE id = ?', ['已借出', bikeId]);
    await conn.query('INSERT INTO bike_record (user_id, bike_id, borrow_time) VALUES (?, ?, ?)', [userId, bikeId, borrowTime]);
    await conn.commit();
    res.json({ success: true, message: '借车成功，祝您骑行愉快！' });
  } catch (err) {
    await conn.rollback();
    res.json({ success: false, message: '借车失败：' + err.message });
  } finally {
    conn.release();
  }
}

async function returnBike(pool, req, res) {
  const recordId = parseInt(req.body.record_id, 10) || 0;
  if (!recordId) {
    return res.json({ success: false, message: 'record_id 为必填项' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT bike_id, borrow_time, return_time FROM bike_record WHERE id = ? FOR UPDATE', [recordId]);
    const record = rows[0];
    if (!record) {
      throw new Error('未找到骑行记录');
    }
    if (record.return_time !== null) {
      throw new Error('该骑行记录已归还');
    }
    const now = new Date();
    const returnTime = now.toISOString().slice(0, 19).replace('T', ' ');
    const borrowTime = new Date(record.borrow_time);
    const diffMinutes = Math.max(1, Math.round((now.getTime() - borrowTime.getTime()) / 60000));
    await conn.query('UPDATE bike_info SET status = ? WHERE id = ?', ['可借用', record.bike_id]);
    await conn.query('UPDATE bike_record SET return_time = ?, duration = ? WHERE id = ?', [returnTime, diffMinutes, recordId]);
    await conn.commit();
    res.json({ success: true, message: `还车成功，骑行时长 ${diffMinutes} 分钟` });
  } catch (err) {
    await conn.rollback();
    res.json({ success: false, message: '还车失败：' + err.message });
  } finally {
    conn.release();
  }
}

async function reportRepair(pool, req, res) {
  const bikeId = parseInt(req.body.bike_id, 10) || 0;
  const reason = String(req.body.reason || '').trim();
  if (!bikeId || !reason) {
    return res.json({ success: false, message: 'bike_id 和 reason 为必填项' });
  }
  const [rows] = await pool.query('SELECT id FROM bike_info WHERE id = ?', [bikeId]);
  if (!rows.length) {
    return res.json({ success: false, message: '未找到该单车' });
  }
  const now = new Date();
  const reportTime = now.toISOString().slice(0, 19).replace('T', ' ');
  await pool.query('INSERT INTO bike_repair (bike_id, reason, report_time) VALUES (?, ?, ?)', [bikeId, reason, reportTime]);
  await pool.query('UPDATE bike_info SET status = ? WHERE id = ?', ['维修', bikeId]);
  res.json({ success: true, message: '报修提交成功，单车已标记为维修状态' });
}

module.exports = { createBikeModule };

async function listOrders(pool, req, res) {
  const userId = parseInt(req.query.user_id, 10) || 0;
  if (!userId) {
    return res.json({ success: false, message: 'user_id 为必填项' });
  }
  const [rows] = await pool.query(
    "SELECT r.id, r.bike_id, b.bike_no, b.position, r.borrow_time, r.return_time, r.duration, r.payment_amount, r.payment_status FROM bike_record r JOIN bike_info b ON r.bike_id = b.id WHERE r.user_id = ? AND r.payment_status = '未支付' ORDER BY r.borrow_time DESC",
    [userId]
  );
  res.json({ success: true, orders: rows });
}

async function payOrder(pool, req, res) {
  const recordId = parseInt(req.body.record_id, 10) || 0;
  if (!recordId) {
    return res.json({ success: false, message: 'record_id 为必填项' });
  }
  const [rows] = await pool.query('SELECT payment_status FROM bike_record WHERE id = ?', [recordId]);
  if (!rows.length) {
    return res.json({ success: false, message: '未找到订单' });
  }
  if (rows[0].payment_status === '已支付') {
    return res.json({ success: false, message: '订单已支付' });
  }
  await pool.query("UPDATE bike_record SET payment_status = '已支付' WHERE id = ?", [recordId]);
  res.json({ success: true, message: '支付成功' });
}
