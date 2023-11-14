/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { check, validationResult, } = require('express-validator'); // validation middleware

const pageDao = require('./dao-pages'); // module for accessing the pages table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB
const systemDao = require('./dao-system'); 

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/**
 * The "delay" middleware introduces some delay in server responses. To change the delay change the value of "delayTime" (specified in milliseconds).
 * This middleware could be useful for debug purposes, to enabling it uncomment the following lines.
 */ 
/*
const delay = require('express-delay');
app.use(delay(200,2000));
*/

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name, admin).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name, admin)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name + admin
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name + admin
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized: not logged'});
}

const checkAdmin = (req, res, next) => { 
  if (req.user && req.user.admin === 1) {
    // L'utente è un amministratore
    next(); // Passa al middleware successivo
  } else {
    // L'utente non è un amministratore
    res.status(401).json({ error: 'Not authorized: not admin' });
  }
};

/*** Utility Functions ***/ 

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

// Middleware validation contents
const validateContents = (req, res, next) => {
  const { contents } = req.body;

  if (!Array.isArray(contents)) {
    return res.status(400).json({ error: 'contents must be an array.' });
  }

  const errors = [];

  const elements = {
    'header': 0,
    'paragraph': 0,
    'image': 0
  };

  contents.forEach((content, index) => {
    if(elements[content.type]==null) 
      errors.push({ index, field: 'type', error: 'type must one of the three' });
    else {
      elements[content.type]++;
    }

    if (typeof content.type !== 'string') {
      errors.push({ index, field: 'type', error: 'type must be a string' });
    }

    if (typeof content.value !== 'string') {
      errors.push({ index, field: 'value', error: 'order must be a string' });
    }

    if (typeof content.order !== 'number') {
      errors.push({ index, field: 'order', error: 'order must be a number' });
    }
  });

  if(elements['header']==0 || elements['paragraph']+elements['image']==0 )
    errors.push({ field: 'contents', error: 'contents must contain at least one header and one paragraph/image' });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

//stitic route for images
app.use('/static', express.static('/img')); 

/*** Pages APIs ***/

app.get('/api/pages', 
  isLoggedIn,
  (req, res) => { 
    pageDao.listAllPages()
    .then(pages => res.json(pages))
    .catch((err) => res.status(500).json(err));
  }
);

app.get('/api/pages/:id',
  isLoggedIn,
  (req, res) => {
    pageDao.getPage(req.params.id)
    .then(page => res.json(page))
    .catch((err) => res.status(500).json(err));
  }
);

app.get('/api/posted/pages',
  (req, res) => { 
    pageDao.listPostedPages()
    .then(pages => res.json(pages))
    .catch((err) => res.status(500).json(err));
  }
);

app.post('/api/pages', 
  isLoggedIn, 
  [
   check('title').isLength({ min: 1, max: 200 }),
   check('dateOfCreation').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }),
   check('dateOfPublication').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }).optional({ nullable: true, checkFalsy: true }),
   validateContents,
  ] 
  ,
  async (req, res) => {
   const errors = validationResult(req).formatWith(errorFormatter); // format error message
   if (!errors.isEmpty()) {
     return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
   }

   try {
     const createdPage = await pageDao.createPage(req.body, req.user); 
     res.status(200).json(createdPage);
   } catch (err) {
     res.status(503).json({ error: `Database error during the creation of the new page: ${err}` }); 
   }
});

app.post('/api/pages/:id', //isLoggedIn  //check userid == user loggato oppure esso è admin
  isLoggedIn,
  [
  check('title').isLength({ min: 1, max: 200 }),
  check('authorId').isInt(),
  check('dateOfCreation').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }),
  check('dateOfPublication').isLength({ min: 10, max: 10 }).isISO8601({ strict: true }).optional({ nullable: true, checkFalsy: true }),
  validateContents,
  ] 
  ,
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
     return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    try {
      const modifiedPage = await pageDao.modifyPage(req.body, req.user); 
     res.status(200).json(modifiedPage);
    } catch (err) {
     res.status(503).json({ error: `Database error during the creation of the new page: ${err}` }); 
   }
});

app.delete('/api/pages/:id', //islogged + controllo tipo utente
  isLoggedIn,
  async (req, res) => {
    try {
      const result = await pageDao.deletePage(req.params.id, req.user);
      if (result == null)
        return res.status(200).json({}); 
      else
        return res.status(404).json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err} ` });
    }
  }
);

app.use('/static', express.static("img"));

// Aggiungi una route per ottenere il contenuto della cartella
app.get('/api/images', (req, res) => {

  const filesname = ['football.jpg', 'luggage.jpg', 'mountain.jpeg', 'sea.jpeg', 'work.jpg'];

  res.json(filesname);
  
});

/** System APIs */

app.get('/api/title',
  (req, res) => { 
    systemDao.getTitle()
    .then(title => res.json(title))
    .catch((err) => res.status(500).json(err));
  }
);

app.put('/api/title', 
  isLoggedIn,
  checkAdmin,
  [
    check('name').isLength({ min: 1, max: 200 })
  ],
  (req, res) => { 

  systemDao.modifyTitle(req.body.name)
  .then(title => {
    res.json(title);
  })
  .catch((err) => res.status(500).json(err));

  /*systemDao.modifyTitle(req.body.name)
  .then(title => {
    setTimeout(() => {
      res.json(title);
    }, 3000);
  })
  .catch(err => res.status(500).json(err));*/
  
  }
);

/*** Users APIs ***/

app.get('/api/users', 
  isLoggedIn,
  checkAdmin,
  (req, res) => { 
    userDao.getUsers()
    .then(users => res.json(users))
    .catch((err) => res.status(500).json(err));
  }
);

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// activate the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});