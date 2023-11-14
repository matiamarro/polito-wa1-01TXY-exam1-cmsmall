import {Page, Content} from './PageContentModel';

const SERVER_URL = 'http://localhost:3001/api/';
const SERVER_URL_STATICS = 'http://localhost:3001/static/';

function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
};

const getPostedPages = async () => {
    return getJson(
        fetch(SERVER_URL + 'posted/pages')
    ).then( json => {
        return json.map((row) => {
            let contents = [];
            row.contents.forEach(e => {
                let content = new Content(e.id, e.type, e.value);
                contents.push(content);
            });
            return new Page(row.id, row.title, row.authorName, row.authorId,
            row.dateOfCreation, row.dateOfPublication, contents);
        })
      });
};

const getAllPages = async () => {
    return getJson(
        fetch(SERVER_URL + 'pages', { credentials: 'include' })
    ).then( json => {
        return json.map((row) => {
            let contents = [];
            row.contents.forEach((e,index) => {
                let content = new Content(index, e.type, e.value);
                contents.push(content);
            });
            return new Page(row.id, row.title, row.authorName, row.authorId,
            row.dateOfCreation, row.dateOfPublication, contents);
        })
      });
};

const getPage = async (id) => {
    return getJson(
        fetch(SERVER_URL + 'pages/' + id, { credentials: 'include' })
        ).then( json => {
            let contents = [];
            json.contents.forEach(e => {
                let content = new Content(e.id, e.type, e.value);
                contents.push(content);
            });
            let pagina = new Page(json.id, json.title, json.authorName, json.authorId,
            json.dateOfCreation, json.dateOfPublication, contents);
            return pagina;    
        });
}

const addPage = async (page) => {
    const response = await fetch(`${SERVER_URL}pages`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(page.serialize()), //page.serialize()
      });
    
      if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
      }
      else return null;
}

const modifyPage = async (page) => {
    const response = await fetch(`${SERVER_URL}pages/` + page.id, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(page.serialize()), //page.serialize()
      });
    
      if(!response.ok) {
        const errMessage = await response.json();
        throw errMessage;
      }
      else return null;
}

const deletePage = async (id) => {
    return getJson(
      fetch(SERVER_URL + "pages/" + id, {
        method: 'DELETE',
        credentials: 'include'
      })
    )
}

const getTitle = async () => {

    return getJson(
        fetch(SERVER_URL + 'title')
    ).then( json => {
        return json.name;
    });
};

const setTitle = async (title) => {

    return getJson(
      fetch(`${SERVER_URL}title`, {
        method: 'PUT',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: title}), //page.serialize()
      })
    ).then( json => {
      return json.name;
    })
    .catch( err => {
      throw err;
    });
    
    /*const response = await fetch(`${SERVER_URL}title`, {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: title}), //page.serialize()
    });
    
    if(!response.ok) {
      const errMessage = await response.json();
      throw errMessage;
    }

    else{
      const res = await response.json();
      return res.name;
    } */
      
    
};

const getImages = async () => {

    return getJson(
        fetch(SERVER_URL + 'images')
    ).then( json => {
        return json.map((image)=>{
            return SERVER_URL_STATICS+image;
        });
    });
};

const getUsers = async () =>{
    return getJson(
        fetch(SERVER_URL + 'users', { credentials: 'include' })
    ).then( json => {
        return json.map((user)=>{
            return {id: user.id, username: user.username, name: user.name, admin: user.admin};
        });
    });

}

/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {

    return getJson(fetch(SERVER_URL + 'sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
      body: JSON.stringify(credentials),
    })
    )
};
  
  /**
   * This function is used to verify if the user is still logged-in.
   * It returns a JSON object with the user info.
   */
  const getUserInfo = async () => {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
      // this parameter specifies that authentication cookie must be forwared
      credentials: 'include'
    })
    )
};
  
  /**
   * This function destroy the current user's session and execute the log-out.
   */
const logOut = async() => {
    return getJson(fetch(SERVER_URL + 'sessions/current', {
        method: 'DELETE',
        credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
        })
    );
};

const API = {logIn, getUserInfo, logOut, getPostedPages, getAllPages, 
  getPage, addPage, modifyPage, deletePage, getTitle, setTitle, getImages, getUsers};
export default API;