/*
 Navicat Premium Dump SQL

 Source Server         : effg
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           : localhost:3306
 Source Schema         : campus_service

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 09/06/2026 17:58:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for class_room
-- ----------------------------
DROP TABLE IF EXISTS `class_room`;
CREATE TABLE `class_room`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `building` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `room_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of class_room
-- ----------------------------
INSERT INTO `class_room` VALUES (1, '教学楼A', '101', 60);
INSERT INTO `class_room` VALUES (2, '教学楼A', '102', 60);
INSERT INTO `class_room` VALUES (3, '教学楼A', '201', 80);
INSERT INTO `class_room` VALUES (4, '教学楼B', '101', 45);
INSERT INTO `class_room` VALUES (5, '教学楼B', '102', 45);
INSERT INTO `class_room` VALUES (6, '实验楼', '101', 30);
INSERT INTO `class_room` VALUES (7, '实验楼', '102', 30);

-- ----------------------------
-- Table structure for lib_seat
-- ----------------------------
DROP TABLE IF EXISTS `lib_seat`;
CREATE TABLE `lib_seat`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `floor` int NOT NULL,
  `seat_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` tinyint NULL DEFAULT 1 COMMENT '1-正常 0-禁用',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lib_seat
-- ----------------------------
INSERT INTO `lib_seat` VALUES (1, 1, 'A01', 1);
INSERT INTO `lib_seat` VALUES (2, 1, 'A02', 1);
INSERT INTO `lib_seat` VALUES (3, 1, 'A03', 1);
INSERT INTO `lib_seat` VALUES (4, 1, 'A04', 1);
INSERT INTO `lib_seat` VALUES (5, 1, 'A05', 1);
INSERT INTO `lib_seat` VALUES (6, 1, 'A06', 1);
INSERT INTO `lib_seat` VALUES (7, 1, 'A07', 1);
INSERT INTO `lib_seat` VALUES (8, 1, 'A08', 1);
INSERT INTO `lib_seat` VALUES (9, 1, 'A09', 1);
INSERT INTO `lib_seat` VALUES (10, 1, 'A10', 1);
INSERT INTO `lib_seat` VALUES (11, 2, 'B01', 1);
INSERT INTO `lib_seat` VALUES (12, 2, 'B02', 1);
INSERT INTO `lib_seat` VALUES (13, 2, 'B03', 1);
INSERT INTO `lib_seat` VALUES (14, 2, 'B04', 1);
INSERT INTO `lib_seat` VALUES (15, 2, 'B05', 1);
INSERT INTO `lib_seat` VALUES (16, 2, 'B06', 1);
INSERT INTO `lib_seat` VALUES (17, 2, 'B07', 1);
INSERT INTO `lib_seat` VALUES (18, 2, 'B08', 1);
INSERT INTO `lib_seat` VALUES (19, 2, 'B09', 1);
INSERT INTO `lib_seat` VALUES (20, 2, 'B10', 1);

-- ----------------------------
-- Table structure for reserve_record
-- ----------------------------
DROP TABLE IF EXISTS `reserve_record`;
CREATE TABLE `reserve_record`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` enum('classroom','library') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `target_id` int NOT NULL,
  `reserve_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('正常','已取消') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '正常',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reserve_record
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
