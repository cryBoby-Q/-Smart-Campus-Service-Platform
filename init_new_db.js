const sqlite3 = require('sqlite3').verbose();

// 创建全新数据库
const db = new sqlite3.Database('./lost_found_new.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('创建数据库错误:', err);
        process.exit(1);
    }
    
    // 设置UTF-8编码
    db.exec('PRAGMA encoding="UTF-8";', (err) => {
        if (err) console.error('设置编码错误:', err);
        
        // 创建表结构
        db.run(`
            CREATE TABLE lost_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type INTEGER NOT NULL,
                goods_type TEXT NOT NULL,
                title TEXT,
                description TEXT,
                location TEXT,
                contact TEXT NOT NULL,
                status INTEGER DEFAULT 1,
                create_time DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('创建表错误:', err);
                process.exit(1);
            }
            
            // 插入演示数据
            const stmt = db.prepare("INSERT INTO lost_items (type, goods_type, title, description, location, contact) VALUES (?, ?, ?, ?, ?, ?)");
            const demoData = [
                [1, '证件', '', '【寻物】本人于6月10日下午3点左右在图书馆二楼电子阅览室丢失身份证一张。姓名：张明，身份证号：411************123。身份证外套有透明卡套，卡套上贴有蓝色星星贴纸。如有拾到者请速联系，必有重谢！联系电话：138****5678。', '图书馆二楼电子阅览室', '138****5678'],
                [2, '手机', '', '【招领】拾到iPhone 14 Pro Max手机一部，颜色为深空黑色，手机背面贴有卡通贴纸，屏幕有轻微划痕。手机壳为透明硅胶材质。拾取地点：第一食堂二楼靠窗位置。请失主描述锁屏密码或手机内特征以核实身份。联系电话：159****1234。', '第一食堂二楼', '159****1234'],
                [2, '钱包', '', '【招领】拾到黑色长款钱包一个，品牌为七匹狼，内含校园卡一张（姓名：王芳，学号：202311020101）、身份证一张、银行卡两张（建设银行、农业银行）及现金若干。拾取地点：体育馆看台第5排座椅下方。请失主描述现金大致金额及其他细节核实。', '体育馆看台', '188****9999'],
                [1, '钥匙', '', '【寻物】丢失钥匙串一串，共有5把钥匙，其中一把为蓝色门禁卡，一个银色U盘（金士顿32G）。U盘内有重要毕业论文资料，如有拾到者请尽快联系，万分感激！丢失地点：教学楼C座3楼至5楼之间。', '教学楼C座', '139****1111'],
                [2, '书本', '', '【招领】拾到《高等数学》教材一本，封面写有"李明"字样，内有笔记若干。拾于教学楼A座301教室。请失主描述书中具体内容核实。', '教学楼A座301', '155****2222'],
                [1, '手机', '', '【寻物】丢失华为P50手机一部，黑色，手机壳为深蓝色硅胶材质。丢失时间6月9日晚，地点在操场看台附近。手机内有重要资料，拾到请速联系。', '操场看台', '177****3333']
            ];
            
            for (const item of demoData) {
                stmt.run(item);
            }
            
            stmt.finalize();
            db.close();
            console.log('✅ 新数据库初始化完成');
            console.log('请将 lost_found_new.db 重命名为 lost_found.db 替换原文件');
        });
    });
});
