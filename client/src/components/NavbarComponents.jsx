import { Nav, Navbar, Container, Button} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom' ;
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavHeaderMain(props) {
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();

    props.logout()
      .then( () => navigate( "/" ) )
      .catch((err) => { 
        setErrorMessage(err.error); setShow(true); 
      });
  };
  
  return (
    <Navbar className="main-navbar-margin mb-3" expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand onClick={() => {navigate('/')}} className='brand-title'>
          {props.title}
        </Navbar.Brand>
        <Nav>
          {props.loggedIn ? (
            <NavDropdown title={props.user.name} id="collasible-nav-dropdown">
              <NavDropdown.Item onClick={() => navigate('/area')} className="link-black">
                Area
              </NavDropdown.Item>
              {props.user.admin ? (
                <NavDropdown.Item onClick={() => navigate('/settings')} className="link-black">
                  Settings
                </NavDropdown.Item>
              ) : null}
              <NavDropdown.Item onClick={handleLogout} className="link-black">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          ) : (
            <Link to='/login' role='button'>
              <Button variant="outline-light">Login</Button>
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>   
    );
}

export default NavHeaderMain;