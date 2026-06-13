-- =============================================
-- 校园跑腿模块数据库脚本
-- 数据库: campus_service
-- 生成时间: 2026-06-12
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_service DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_service;

-- =============================================
-- 1. 跑腿订单表 run_order
-- =============================================
DROP TABLE IF EXISTS run_order;
CREATE TABLE run_order (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    user_id INT NOT NULL DEFAULT 1 COMMENT '用户ID',
    order_type VARCHAR(20) NOT NULL COMMENT '订单类型：外卖/快递/零食',
    address VARCHAR(200) NOT NULL COMMENT '收货地址',
    goods_info TEXT COMMENT '商品信息描述',
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '配送费用',
    status VARCHAR(20) NOT NULL DEFAULT '待接单' COMMENT '状态：待接单/配送中/已完成/已取消',
    rider_id INT COMMENT '骑手ID',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_rider_id (rider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='跑腿订单表';

-- 插入测试订单数据
INSERT INTO run_order (user_id, order_type, address, goods_info, price, status, rider_id) VALUES
(1, '外卖', '3号楼 302室', '黄焖鸡米饭一份，微辣', 5.00, '待接单', NULL),
(1, '快递', '5号楼 501室', '顺丰快递，在菜鸟驿站', 3.00, '配送中', 1),
(2, '零食', '2号楼 203室', '可乐2瓶，薯片1包', 4.00, '已完成', 2),
(1, '外卖', '1号楼 105室', '奶茶三杯，少冰', 6.00, '待接单', NULL),
(2, '快递', '4号楼 402室', '京东快递，大件', 5.00, '已取消', NULL);

-- =============================================
-- 2. 骑手信息表 run_rider
-- =============================================
DROP TABLE IF EXISTS run_rider;
CREATE TABLE run_rider (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '骑手ID',
    rider_name VARCHAR(50) NOT NULL COMMENT '骑手姓名',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    status VARCHAR(10) NOT NULL DEFAULT '在线' COMMENT '状态：在线/离线',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='骑手信息表';

-- 插入测试骑手数据
INSERT INTO run_rider (rider_name, phone, status) VALUES
('张同学', '13800138001', '在线'),
('李同学', '13800138002', '在线'),
('王同学', '13800138003', '离线'),
('赵同学', '13800138004', '在线');

-- =============================================
-- 3. 用户收货地址表 run_address
-- =============================================
DROP TABLE IF EXISTS run_address;
CREATE TABLE run_address (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
    user_id INT NOT NULL COMMENT '用户ID',
    address_detail VARCHAR(200) NOT NULL COMMENT '详细地址',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 插入测试地址数据
INSERT INTO run_address (user_id, address_detail) VALUES
(1, '1号楼 101室'),
(1, '3号楼 302室'),
(1, '5号楼 501室'),
(2, '2号楼 203室'),
(2, '4号楼 402室');

-- =============================================
-- 数据验证查询
-- =============================================
SELECT '订单表数据' AS table_name, COUNT(*) AS count FROM run_order
UNION ALL
SELECT '骑手表数据', COUNT(*) FROM run_rider
UNION ALL
SELECT '地址表数据', COUNT(*) FROM run_address;
