-- =====================================================
-- 创建订单表和订单详情表
-- =====================================================

-- 1. 订单表
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    `status` VARCHAR(20) DEFAULT '待付款' COMMENT '订单状态：待付款/已付款/已发货/已完成/已取消',
    `receiver_name` VARCHAR(50) COMMENT '收货人姓名',
    `receiver_phone` VARCHAR(20) COMMENT '收货人电话',
    `receiver_address` VARCHAR(200) COMMENT '收货地址',
    `remark` TEXT COMMENT '备注',
    `create_time` DATETIME DEFAULT NOW() COMMENT '下单时间',
    `pay_time` DATETIME COMMENT '付款时间',
    `complete_time` DATETIME COMMENT '完成时间',
    INDEX idx_user (`user_id`),
    INDEX idx_order_no (`order_no`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 2. 订单详情表
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '详情ID',
    `order_id` INT NOT NULL COMMENT '订单ID',
    `goods_id` INT NOT NULL COMMENT '商品ID',
    `goods_title` VARCHAR(200) NOT NULL COMMENT '商品标题',
    `goods_price` DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    `quantity` INT NOT NULL COMMENT '购买数量',
    `total_price` DECIMAL(10,2) NOT NULL COMMENT '小计',
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    INDEX idx_order (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

SELECT '✅ 订单表创建成功！' AS 结果;