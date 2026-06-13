const sqlite3 = require('sqlite3').verbose();

// 创建新数据库(UTF-8编码)
const newDb = new sqlite3.Database('./lost_found_new.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('创建新数据库错误:', err);
        process.exit(1);
    }
    newDb.exec('PRAGMA encoding="UTF-8";', (err) => {
        if (err) console.error('设置编码错误:', err);
        
        // 创建表结构
        newDb.run(`
            CREATE TABLE IF NOT EXISTS lost_items (
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
            
            // 连接旧数据库
            const oldDb = new sqlite3.Database('./lost_found.db', sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error('打开旧数据库错误:', err);
                    process.exit(1);
                }
                
                // 迁移数据
                oldDb.each('SELECT * FROM lost_items', (err, row) => {
                    if (err) {
                        console.error('查询旧数据错误:', err);
                        return;
                    }
                    
                    newDb.run(
                        'INSERT INTO lost_items (type, goods_type, title, description, location, contact, status, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [row.type, row.goods_type, row.title, row.description, row.location, row.contact, row.status, row.create_time],
                        (err) => {
                            if (err) console.error('插入数据错误:', err);
                        }
                    );
                }, (err, count) => {
                    if (err) console.error('迁移完成错误:', err);
                    console.log(`成功迁移 ${count} 条记录`);
                    
                    oldDb.close();
                    newDb.close();
                    
                    console.log('✅ 数据库迁移完成');
                    console.log('请将 lost_found_new.db 重命名为 lost_found.db 替换原文件');
                });
            });
        });
    });
});
