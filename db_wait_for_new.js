const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lost_found.db');

function getMax(cb) {
  db.get('SELECT MAX(id) as maxid FROM lost_items', (err,row)=>{
    if(err) return cb(err);
    cb(null, row && row.maxid ? row.maxid : 0);
  });
}

getMax((err, last) => {
  if (err) { console.error('ERR', err); process.exit(1); }
  console.log('Watching for new records after id=', last);
  function poll() {
    db.get('SELECT MAX(id) as maxid FROM lost_items', (e,row)=>{
      if (e) { console.error('ERR', e); process.exit(2); }
      const m = row && row.maxid ? row.maxid : 0;
      if (m > last) {
        db.get('SELECT * FROM lost_items WHERE id = ?', [m], (er, rec) => {
          if (er) { console.error('ERR', er); process.exit(3); }
          console.log('NEW_RECORD', JSON.stringify(rec));
          process.exit(0);
        });
      } else {
        setTimeout(poll, 1000);
      }
    });
  }
  poll();
});