'use strict';

const db = require('./db');
const dayjs = require("dayjs");

exports.listImages = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM images';
        db.all(sql, [], (err, rows) => {
            if (err) { reject(err); }

            resolve(rows);
        
        });
    });
}

exports.getPage = (id) => {
    return new Promise(async (resolve, reject) => {
      const sql =
        'SELECT *, pages.id as pageId, contents.id AS contentId, users.name AS authorName\
        FROM pages, contents, users \
        WHERE contents.pageId = pages.id AND pages.id = ? AND users.id=pages.authorId\
        ORDER BY pages.dateOfPublication, contents.nOrder';

        db.all(sql, [id], (err, rows) => {
        if (err) {
          reject(err);
        }
  
        let page; 
  
        rows.forEach((row) => {
            let content = {
                id: row.contentId,
                type: row.type,
                value: row.value,
                order: row.nOrder,
            };

            if(!page){
            page = {id: row.pageId, title: row.title, authorId: row.authorId,
                authorName: row.authorName, dateOfCreation: row.dateOfCreation, 
                dateOfPublication: row.dateOfPublication, contents: [content]}
            }
            else{
                page.contents.push(content);
            }
  
        });
  
        resolve(page); // Restituisci direttamente la pagina
      });
    });
  };
  
  
exports.listAllPages = () => { 
    return new Promise(async (resolve, reject) => { 

        const sql = 'SELECT *, pages.id as pageId, contents.id AS contentId, users.name AS authorName \
            FROM pages, contents, users \
            WHERE contents.pageId = pages.id AND users.id=pages.authorId\
            ORDER BY pages.dateOfPublication, contents.nOrder';

        db.all(sql, [], (err, rows) => {
        if (err) { reject(err); }

        let allpages={};

        rows.forEach((row) => {

            let page = {id: row.pageId, title: row.title, authorId: row.authorId,
                authorName: row.authorName, dateOfCreation: row.dateOfCreation, 
                dateOfPublication: row.dateOfPublication, contents: []}

            const content = {id: row.contentId, type: row.type, 
                value: row.value, order: row.nOrder}
            
            if(!allpages[page.id]){

                page.contents = [content];
                allpages[page.id] = page;
            }
            else {
                allpages[page.id].contents.push(content)
            }
        });

        resolve(Object.values(allpages));
        });   
    });
};

exports.listPostedPages = () => { 
    return new Promise(async (resolve, reject) => { 

        const sql = 'SELECT *, contents.id AS contentId, users.name AS authorName \
            FROM pages, contents, users \
            WHERE contents.pageId = pages.id AND users.id=pages.authorId AND\
            dateOfPublication <= ? \
            ORDER BY pages.dateOfPublication, contents.nOrder';

        db.all(sql, [dayjs().format('YYYY-MM-DD')], (err, rows) => {
        if (err) { reject(err); }

        let allpages={};

        rows.forEach((row) => {
            let page = {id: row.pageId, title: row.title, authorId: row.authorId,
                authorName: row.authorName, dateOfCreation: row.dateOfCreation, 
                dateOfPublication: row.dateOfPublication, contents: []}

            const content = {id: row.contentId, type: row.type, 
                value: row.value, order: row.nOrder}
            
            if(!allpages[page.id]){

                page.contents = [content];
                allpages[page.id] = page;
            }
            else {
                allpages[page.id].contents.push(content)
            }
        });

        resolve(Object.values(allpages));
        });   
    });
}; 

exports.createPage = (page, user) => { 
    return new Promise((resolve, reject) => {
        if(user.admin != 1 && page.authorId != user.id) reject({ error: 'Unauthorized' });
        const sqlPage = 'INSERT INTO pages (title, authorId, dateOfCreation, dateOfPublication) VALUES (?, ?, ?, ?)';
            db.run(sqlPage, [page.title, page.authorId, page.dateOfCreation, page.dateOfPublication], function(err) {
            if (err) {
                reject(err);
            }
            else{
                const pageId = this.lastID;
                const sqlContent = 'INSERT INTO contents (pageId, type, value, nOrder) VALUES (?, ?, ?, ?)';
                page.contents.forEach((content) => {
                    db.run(sqlContent, [pageId, content.type, content.value, content.order], function(err) {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                        
                resolve(exports.getPage(pageId));
            }
        });
    });
}

exports.modifyPage = (page, user) => {
    return new Promise((resolve, reject) => {
      if (user.admin || page.authorId === user.id) {
        exports
          .deletePage(page.id, user)
          .then(() => exports.createPage(page, user.id)) 
          .then((res) => resolve(res))
          .catch((error) => reject(error));
      } else {
        reject({ error: 'Unauthorized' }); 
      }
    });
  };
  

exports.deletePage = (pageId, user) => { 
    return new Promise((resolve, reject) => {
        let params = [];
        let sqlPages = '';

        if (user.admin) {
            sqlPages = 'DELETE FROM pages WHERE id = ?';
            params.push(pageId);
        } else {
            sqlPages = 'DELETE FROM pages WHERE id = ? AND authorId = ?';
            params.push(pageId, user.id);
        }

        db.run(sqlPages, params, function (err) {
            if (err) {
                reject(err);
            }
            if (this.changes === 0)
                resolve({ error: 'No page deleted. None to delete or unauthorized user' });

            else{
                const sqlcontents = 'DELETE FROM contents WHERE pageId=?';
                db.run(sqlcontents, [pageId], function (err) {
                    if (err) {
                        reject(err);
                    }
                    if (this.changes === 0)
                        resolve({ error: 'No page content deleted.' });

                    else{
                        resolve(null);
                    }
                });   
            }
        });                 
      });
}
  
