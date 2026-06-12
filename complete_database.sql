-- =====================================================
-- 校园二手交易平台 - 完整数据库（Emoji图标版）
-- 包含：用户表、商品表、收藏表、留言表、购物车表
-- =====================================================

-- 第一步：删除旧表（如果有）
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `message`;
DROP TABLE IF EXISTS `collect`;
DROP TABLE IF EXISTS `goods`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- 第二步：创建用户表
-- =====================================================
CREATE TABLE `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `avatar` VARCHAR(500) COMMENT '头像',
    `phone` VARCHAR(20) COMMENT '手机号',
    `school` VARCHAR(100) COMMENT '学校',
    `create_time` DATETIME DEFAULT NOW() COMMENT '注册时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================================================
-- 第三步：创建商品表（带Emoji图标）
-- =====================================================
CREATE TABLE `goods` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    `user_id` INT NOT NULL COMMENT '发布者ID',
    `title` VARCHAR(200) NOT NULL COMMENT '商品标题',
    `type` VARCHAR(50) NOT NULL COMMENT '商品分类',
    `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
    `content` TEXT COMMENT '商品描述',
    `img` VARCHAR(50) DEFAULT '📦' COMMENT 'Emoji图标',
    `status` VARCHAR(20) DEFAULT '上架' COMMENT '状态：上架/下架/已售',
    `view_count` INT DEFAULT 0 COMMENT '浏览次数',
    `create_time` DATETIME DEFAULT NOW() COMMENT '发布时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- =====================================================
-- 第四步：创建收藏表
-- =====================================================
CREATE TABLE `collect` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `goods_id` INT NOT NULL COMMENT '商品ID',
    `create_time` DATETIME DEFAULT NOW() COMMENT '收藏时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- =====================================================
-- 第五步：创建留言表
-- =====================================================
CREATE TABLE `message` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '留言ID',
    `goods_id` INT NOT NULL COMMENT '商品ID',
    `from_user_id` INT NOT NULL COMMENT '留言用户ID',
    `content` TEXT NOT NULL COMMENT '留言内容',
    `msg_time` DATETIME DEFAULT NOW() COMMENT '留言时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='留言表';

-- =====================================================
-- 第六步：创建购物车表
-- =====================================================
CREATE TABLE `cart` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车ID',
    `user_id` INT NOT NULL COMMENT '用户ID',
    `goods_id` INT NOT NULL COMMENT '商品ID',
    `quantity` INT DEFAULT 1 COMMENT '数量',
    `create_time` DATETIME DEFAULT NOW() COMMENT '添加时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';

-- =====================================================
-- 第七步：插入用户数据（5个用户）
-- =====================================================
INSERT INTO `users` (`id`, `username`, `password`, `nickname`, `phone`, `school`) VALUES
(1, 'zhangsan', '123456', '张三同学', '13800138001', '清华大学'),
(2, 'lisi', '123456', '李四学长', '13800138002', '北京大学'),
(3, 'wangwu', '123456', '王五', '13800138003', '复旦大学'),
(4, 'zhaoliu', '123456', '赵六', '13800138004', '上海交通大学'),
(5, 'xiaoming', '123456', '小明', '13800138005', '浙江大学');

-- =====================================================
-- 第八步：插入商品数据（25个商品，带Emoji图标）
-- =====================================================

-- 二手书类（📖）
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(1, 1, '《JavaScript高级程序设计》第4版', '二手书', 45, '九成新，无笔记，前端必读红宝书', '📖', '上架'),
(2, 1, '《数据结构与算法分析》', '二手书', 35, '经典教材，少量笔记，考研必备', '📖', '上架'),
(3, 1, '《考研数学复习全书》', '二手书', 30, '全新未拆封，数一数二通用', '📖', '上架'),
(4, 1, '《深入理解计算机系统》', '二手书', 50, 'CSAPP经典，九成新', '📖', '上架'),
(5, 1, '《三体》全集', '二手书', 35, '全新未拆封，刘慈欣科幻巨作', '📖', '上架'),
(6, 1, '《你当像鸟飞往你的山》', '二手书', 25, '九成新，畅销书', '📖', '上架'),
(7, 2, '《Python编程从入门到实践》', '二手书', 40, '九成新，Python入门经典', '📖', '上架');

-- 电子产品类（💻）
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(8, 2, '小米无线蓝牙耳机Air2', '电子产品', 80, '几乎全新，充电仓完整', '💻', '上架'),
(9, 3, '罗技M185无线鼠标', '电子产品', 35, '手感好，办公学习必备', '💻', '上架'),
(10, 1, '机械键盘青轴', '电子产品', 120, 'RGB光效，手感清脆', '💻', '上架'),
(11, 3, '充电宝20000mAh', '电子产品', 40, '双向快充，可上飞机', '💻', '上架'),
(12, 3, '小米手环7', '电子产品', 120, '心率监测，血氧检测', '💻', '上架'),
(13, 3, '飞利浦剃须刀', '电子产品', 80, '充电式，刀头锋利', '💻', '上架'),
(14, 2, 'iPad Air 64G', '电子产品', 1800, '九成新，带保护壳', '💻', '上架'),
(15, 1, '小米手环8', '电子产品', 150, '全新未拆封', '💻', '上架');

-- 生活用品类（🛋️）
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(16, 2, '宿舍床上书桌', '生活用品', 25, '可折叠，九成新', '🛋️', '上架'),
(17, 1, '护眼LED台灯', '生活用品', 28, 'USB充电，三档调光', '🛋️', '上架'),
(18, 2, '电热水壶1.5L', '生活用品', 35, '304不锈钢，自动断电', '🛋️', '上架'),
(19, 2, '宿舍小冰箱38L', '生活用品', 200, '八成新，制冷正常', '🛋️', '上架'),
(20, 1, '洗衣液4斤装', '生活用品', 30, '全新未开封', '🛋️', '上架');

-- 体育用品类（⚽）
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(21, 2, '加厚防滑瑜伽垫', '体育用品', 45, '加厚款，无异味，送收纳袋', '⚽', '上架'),
(22, 2, '斯伯丁篮球', '体育用品', 60, '七成新，手感好', '⚽', '上架'),
(23, 2, '羽毛球拍一对', '体育用品', 80, '九成新，送三个球', '⚽', '上架'),
(24, 3, '哑铃套装20kg', '体育用品', 150, '可调节重量', '⚽', '上架');

-- 服饰鞋包类（👔）
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(25, 3, '耐克运动鞋42码', '服饰鞋包', 150, '九成新，仅穿两次', '👔', '上架'),
(26, 3, '优衣库卫衣M码', '服饰鞋包', 55, '全新带吊牌', '👔', '上架'),
(27, 2, '阿迪达斯双肩包', '服饰鞋包', 80, '九成新，大容量', '👔', '上架');

-- 下架商品示例
INSERT INTO `goods` (`id`, `user_id`, `title`, `type`, `price`, `content`, `img`, `status`) VALUES
(28, 1, '旧款手机壳', '其他', 10, '已下架', '🎁', '下架');

-- =====================================================
-- 第九步：插入收藏数据
-- =====================================================
INSERT INTO `collect` (`id`, `user_id`, `goods_id`) VALUES
(1, 1, 8),
(2, 1, 21),
(3, 1, 25),
(4, 2, 1),
(5, 2, 10),
(6, 3, 16),
(7, 3, 5);

-- =====================================================
-- 第十步：插入留言数据
-- =====================================================
INSERT INTO `message` (`id`, `goods_id`, `from_user_id`, `content`) VALUES
(1, 1, 2, '这本书还在吗？可以小刀吗？'),
(2, 1, 1, '在的，可以优惠5元'),
(3, 8, 1, '耳机用了多久？'),
(4, 8, 2, '用了半年，很新'),
(5, 10, 2, '键盘什么轴？'),
(6, 10, 1, '青轴，打字手感很好'),
(7, 25, 1, '鞋子偏码吗？'),
(8, 25, 3, '不偏，正常42码');

-- =====================================================
-- 第十一步：插入购物车数据
-- =====================================================
INSERT INTO `cart` (`id`, `user_id`, `goods_id`, `quantity`) VALUES
(1, 1, 9, 1),
(2, 1, 22, 2),
(3, 2, 1, 1);

-- =====================================================
-- 第十二步：查看统计结果
-- =====================================================
SELECT '========== 数据统计 ==========' AS '';
SELECT COUNT(*) AS '用户总数' FROM users;
SELECT COUNT(*) AS '商品总数' FROM goods;
SELECT COUNT(*) AS '上架商品数' FROM goods WHERE status = '上架';
SELECT COUNT(*) AS '收藏总数' FROM collect;
SELECT COUNT(*) AS '留言总数' FROM message;
SELECT COUNT(*) AS '购物车商品数' FROM cart;

SELECT '========== 各品类商品数量 ==========' AS '';
SELECT type AS '品类', img AS '图标', COUNT(*) AS '数量' FROM goods WHERE status = '上架' GROUP BY type;

SELECT '========== 商品列表预览 ==========' AS '';
SELECT id, img, title, type, price FROM goods WHERE status = '上架' LIMIT 10;

SELECT '✅ 数据库创建完成！共 ' || (SELECT COUNT(*) FROM goods) || ' 个商品' AS '结果';