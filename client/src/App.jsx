import 'bootstrap/dist/css/bootstrap.min.css'; //react bootstrap chiede l'import del css visto che lo usa
import './mystyle.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom' ;
import {DefaultLayout, HomeLayout, PersonalLayout, AddLayout, EditLayout, LoginLayout, SettingsLayout} from './components/Layouts';
import { useState, useEffect } from 'react';
import API from './API';
import MessageContext from './messageCtx';

function App() {
  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info: id,username(email),name,admin
  const [user, setUser] = useState(null); 

  const [title, setTitle] = useState('');

  const handleErrors = (err) => {
    let msg = '';
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    console.log(msg); 
  }

   /**
   * This function handles the login process.
   * It requires a username and a password inside a "credentials" object.
   */
   const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */ 
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const newtitle = await API.getTitle();  
        setTitle(newtitle);
      } catch (err) {
        handleErrors(err); 
      }
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); 
      } catch (err) {
        handleErrors(err); 
        setUser(null);
        setLoggedIn(false); 
      }
    };
    init();
  }, []);  // This useEffect is called only the first time the component is mounted.

  return (
    <>
    <BrowserRouter>  
      <MessageContext.Provider value={{ handleErrors }}>
        <Routes> 
          <Route path="/" element={<DefaultLayout title={title} loggedIn={loggedIn} user={user} logout={handleLogout}/>}>
            <Route index element={<HomeLayout/>}/>
            <Route path="add" element={loggedIn ? <AddLayout user={user}/> : <Navigate replace to='/' />}/>
            <Route path="edit" element={loggedIn ? <EditLayout user={user}/> : <Navigate replace to='/' />}/>
            <Route path="area" element={loggedIn ? <PersonalLayout user={user}/> :
              <Navigate replace to='/login'/>}/>
          </Route> 
          <Route path="*" element={<p>404 Page not found</p>}/>
          <Route path="/login" element={!loggedIn ? <LoginLayout login={handleLogin}/> : <Navigate replace to='/' />}/> 
          <Route path="/settings" element={loggedIn && user.admin ? <SettingsLayout title={title} setTitle={setTitle}/> : <Navigate replace to='/' />}/> 
        </Routes> 
      </MessageContext.Provider>
    </BrowserRouter>
    </>
  )
}

export default App
