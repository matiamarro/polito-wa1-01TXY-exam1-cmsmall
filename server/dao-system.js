'use strict';

const db = require('./db');

exports.getTitle = () => {
    return new Promise(async (resolve, reject) => { 

        const sql = 'SELECT name  \
        FROM system_settings';

        db.get(sql, [], (err, row) => {
            if (err) { reject(err); }
            else { resolve(row); }
        });
    });
}

exports.modifyTitle = (name) => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE system_settings SET name = ?';
      db.run(sql, [name], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(exports.getTitle());
        }
      });
    });
  };
  