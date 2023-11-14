'use strict';

const db = require('./db');
const crypto = require('crypto');

exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const users = rows.map((row) => ({
          id: row.id,
          username: row.email,
          name: row.name,
          admin: row.admin
        }));
        resolve(users);
      }
    });
  });
};

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id=?';
      db.get(sql, [id], (err, row) => {
        if (err)
          reject(err);
        else if (row === undefined)
          resolve({ error: 'User not found.' });
        else {
          const user = { id: row.id, username: row.email, name: row.name }
          resolve(user);
        }
      });
    });
};
  
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email=?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          resolve(false);
        }
        else {
          const user = { id: row.id, username: row.email, name: row.name, admin: row.admin };
  
          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { 
            if (err) reject(err);
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) 
              resolve(false);
            else
              resolve(user);
          });
        }
      });
    });
};