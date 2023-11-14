import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Row, Container, Alert } from 'react-bootstrap';
import NavHeaderMain from './NavbarComponents';
import { LoginForm } from './Auth';
import { useState, useEffect, useContext } from 'react';
import API from './../API';
import MessageContext from '../messageCtx';
import { SettingsForm } from './SettingsForm';
import { PageComponent, EditPageComponent } from './PageComponents';

function DefaultLayout(props) {
    return (
        <>
         <NavHeaderMain title={props.title} loggedIn={props.loggedIn} user={props.user} logout={props.logout}/>
         <Container className='app-container '>
            <Row className='app-container'>
                <Outlet/>
            </Row>
         </Container>       
        </>
    );
}

function HomeLayout(props) {
    const {handleErrors} = useContext(MessageContext);

    const [postedPages, setPostedPages] = useState([]);

    useEffect(() => {
        API.getPostedPages()
        .then(pages => {
            pages.sort((a,b) => {return a.cmpByPublicationDate(b)});              
            setPostedPages(pages);
        })
        .catch(e => { 
            handleErrors(e); 
        } ); 
        
      }, []);

    return (
        <>
        <PageComponent pages={postedPages}/>
        </>
    );
}

function PersonalLayout(props) {
    const {handleErrors} = useContext(MessageContext);

    const navigate = useNavigate();

    const [pages, setPages] = useState([]);

    const deletePage = (id) => {
        API.deletePage(id)
        .then(obj => {
            navigate("/");
        })
        .catch(e => { 
            handleErrors(e); 
        } ); 
    }

    useEffect(() => {
        API.getAllPages()
        .then(newpages => {
            newpages.sort((a,b) => {return a.cmpByPublicationDate(b)});
            setPages(newpages);
        })
        .catch(e => { 
            handleErrors(e); 
        } ); 
        
      }, []);    
    return (
        <>
        <PageComponent modify={1} user={props.user} pages={pages} deletePage={deletePage}/>
        </>
    );
}

function AddLayout(props) {
    const {handleErrors} = useContext(MessageContext);

    const navigate = useNavigate();

    const [waiting, setWaiting] = useState(false);

    const addPage = (page) => {
        setWaiting(true);
        API.addPage(page)
          .then(() => { navigate(-1); })
          .catch(e => handleErrors(e)); 
    }

    return(
        <>
        {waiting ? <Alert variant="secondary">Please, wait for the server's answer...</Alert> :
        <EditPageComponent user={props.user} addPage={addPage}/> }
        </>
    );
}

function EditLayout(props) {

    const {handleErrors} = useContext(MessageContext);

    const location = useLocation();
    const pageId = location.state.pageId;

    const [page, setPage] = useState(null);
    const [waiting, setWaiting] = useState(false);

    const navigate = useNavigate();

    const modifyPage = (page) => {
        setWaiting(true);
        API.modifyPage(page)
          .then(() => { navigate(-1); })
          .catch(e => {
            handleErrors(e);
            navigate('/');
        }); 
    }

    useEffect(() => {
        API.getPage(pageId)
        .then(newpage => {
            setPage(newpage);
        })
        .catch(e => {
            handleErrors(e); 
            navigate('/');
        }); 
    }, [pageId]);
    
    return (
        waiting ? <Alert variant="secondary">Please, wait for the server update...</Alert> :
        page ? <EditPageComponent modify={1} user={props.user} page={page} addPage={modifyPage}/> : <></>
    );
}

function LoginLayout(props) {
    return (
        <LoginForm login={props.login} />
    );
}

function SettingsLayout(props) {
    const {handleErrors} = useContext(MessageContext);
    const navigate = useNavigate();
    const updateTitle = (title) => {
        API.setTitle(title)
        .then(newtitle => {
            props.setTitle(newtitle);
            navigate('/');
        })
        .catch(e => {
            handleErrors(e); 
        }); 
      }

    return (
        <SettingsForm title={props.title} updateTitle={updateTitle} />
    );
}

export {DefaultLayout, HomeLayout, PersonalLayout, AddLayout, EditLayout, LoginLayout, SettingsLayout};