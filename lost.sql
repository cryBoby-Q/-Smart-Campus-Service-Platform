-- =============================================
-- 校园失物招领系统数据库脚本
-- 数据库: campus_service
-- 生成时间: 2026
-- =============================================

CREATE DATABASE IF NOT EXISTS `campus_service` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `campus_service`;

-- =============================================
-- 表1: lost_found 失物招领主表
-- =============================================
DROP TABLE IF EXISTS `lost_found`;
CREATE TABLE `lost_found` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `user_id` INT NOT NULL DEFAULT 1 COMMENT '发布用户ID',
  `type` TINYINT NOT NULL COMMENT '类型：1-寻物启事 2-招领信息',
  `goods_type` VARCHAR(50) NOT NULL COMMENT '物品类型：证件/手机/书本/钱包/钥匙/其他',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `description` TEXT NOT NULL COMMENT '物品描述',
  `contact` VARCHAR(100) NOT NULL COMMENT '联系方式',
  `location` VARCHAR(100) DEFAULT '' COMMENT '丢失/拾取地点',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-未认领 2-已认领',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  INDEX idx_type (`type`),
  INDEX idx_status (`status`),
  INDEX idx_goods_type (`goods_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='失物招领主表';

-- =============================================
-- 表2: lost_claim 认领申请表
-- =============================================
DROP TABLE IF EXISTS `lost_claim`;
CREATE TABLE `lost_claim` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `info_id` INT NOT NULL COMMENT '关联失物招领ID',
  `claim_user_id` INT NOT NULL DEFAULT 1 COMMENT '认领用户ID',
  `claim_reason` TEXT NOT NULL COMMENT '认领说明',
  `claim_contact` VARCHAR(100) NOT NULL COMMENT '认领人联系方式',
  `claim_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  FOREIGN KEY (`info_id`) REFERENCES `lost_found`(`id`) ON DELETE CASCADE,
  INDEX idx_info_id (`info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='认领申请表';

-- =============================================
-- 插入测试数据 - 失物招领信息
-- =============================================
INSERT INTO `lost_found` (`user_id`, `type`, `goods_type`, `title`, `description`, `contact`, `location`, `status`, `create_time`) VALUES
(1, 1, '证件', '寻找身份证', '本人于6月10日在图书馆丢失身份证一张，姓名张三，望拾到者联系，万分感谢！', '13800138001', '图书馆二楼', 1, '2026-06-10 09:30:00'),
(2, 1, '手机', '寻找黑色iPhone手机', '6月11日在食堂丢失黑色iPhone 13手机一部，手机壳为蓝色，有重要资料，必有重谢！', '13800138002', '第一食堂', 1, '2026-06-11 12:15:00'),
(3, 2, '书本', '拾到高等数学教材一本', '在教学楼A座302教室拾到高等数学教材一本，书上有李同学笔记，请失主联系认领', '13800138003', '教学楼A302', 1, '2026-06-11 14:20:00'),
(4, 2, '钱包', '拾到棕色钱包一个', '在操场看台下拾到棕色钱包一个，内有银行卡若干，现金200元，请失主携带有效证件认领', '13800138004', '操场看台', 1, '2026-06-11 17:45:00'),
(5, 1, '钥匙', '寻找宿舍钥匙一串', '今天下午在校园内丢失宿舍钥匙一串，共3把钥匙，带小熊挂件，找到请联系', '13800138005', '校园内', 1, '2026-06-12 08:00:00'),
(6, 2, '证件', '拾到学生证一张', '在二号宿舍楼楼下拾到学生证一张，学号2023001001，请失主联系', '13800138006', '二号宿舍楼', 2, '2026-06-09 16:30:00'),
(7, 1, '其他', '寻找蓝色雨伞', '昨天下雨在图书馆门口丢失蓝色折叠雨伞一把，伞柄有磨损痕迹', '13800138007', '图书馆门口', 1, '2026-06-12 10:00:00'),
(8, 2, '其他', '拾到眼镜一副', '在自习室拾到黑框近视眼镜一副，度数约300度，请失主前来认领', '13800138008', '自习室B区', 1, '2026-06-12 11:30:00');

-- =============================================
-- 插入测试数据 - 认领申请
-- =============================================
INSERT INTO `lost_claim` (`info_id`, `claim_user_id`, `claim_reason`, `claim_contact`, `claim_time`) VALUES
(6, 7, '这是我的学生证，学号确实是2023001001，可以核对照片', '13800138009', '2026-06-10 10:00:00');
