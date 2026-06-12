-- campus_service 数据库共享单车模块
-- 请在 Navicat 中执行以下 SQL 创建数据表并插入测试数据

CREATE DATABASE IF NOT EXISTS campus_service DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_service;

DROP TABLE IF EXISTS bike_repair;
DROP TABLE IF EXISTS bike_record;
DROP TABLE IF EXISTS bike_info;

CREATE TABLE bike_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bike_no VARCHAR(32) NOT NULL UNIQUE,
  position VARCHAR(128) NOT NULL,
  status ENUM('可借用','已借出','维修') NOT NULL DEFAULT '可借用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bike_record (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bike_id INT NOT NULL,
  borrow_time DATETIME NOT NULL,
  return_time DATETIME DEFAULT NULL,
  duration INT DEFAULT NULL,
  payment_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('未支付','已支付') NOT NULL DEFAULT '未支付',
  INDEX idx_user_id (user_id),
  INDEX idx_bike_id (bike_id),
  CONSTRAINT fk_bike_record_bike FOREIGN KEY (bike_id) REFERENCES bike_info(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bike_repair (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bike_id INT NOT NULL,
  reason TEXT NOT NULL,
  report_time DATETIME NOT NULL,
  handle_status ENUM('待处理','已处理') NOT NULL DEFAULT '待处理',
  INDEX idx_repair_bike (bike_id),
  CONSTRAINT fk_bike_repair_bike FOREIGN KEY (bike_id) REFERENCES bike_info(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO bike_info (bike_no, position, status) VALUES
('BJ-1001', '教学楼北门', '可借用'),
('BJ-1002', '教学楼北门', '可借用'),
('BJ-1003', '图书馆门口', '已借出'),
('BJ-1004', '图书馆门口', '维修'),
('BJ-1005', '食堂入口', '可借用'),
('BJ-1006', '学校大门', '可借用'),
('BJ-1007', '食堂入口', '可借用'),
('BJ-1008', '学校大门', '可借用');

INSERT INTO bike_record (user_id, bike_id, borrow_time, return_time, duration, payment_amount, payment_status) VALUES
(1, 3, '2026-06-08 08:20:00', '2026-06-08 08:55:00', 35, 12.00, '未支付'),
(1, 2, '2026-06-09 10:00:00', '2026-06-09 10:25:00', 25, 8.00, '已支付');
