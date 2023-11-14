import {Card , ListGroup, Button, Col, Row, Form, Modal, Alert, Container} from 'react-bootstrap';
import { Link , useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import {Page, Content} from './../PageContentModel'
import dayjs from 'dayjs';
import API from '../API';

function PageComponent(props) {
    const pages = props.pages;
    const [index, setIndex] = useState(0);

    const addIndex = () =>{
        if(index < pages.length-1){
            setIndex(index+1);
        }
    }

    const decrementIndex = () =>{
        if(index > 0){
            setIndex(index-1);
        }
    }
    
    return (
        <>
        <Col className='column'>
            <Container className="centered-container">
                {index > 0 ? <Button variant="outline-dark " className="btn-icon" onClick={decrementIndex}><i className="bi bi-arrow-left"></i></Button> : null}
            </Container>
        </Col>
        <Col xs={8}>            
        {pages[index] ? <Row><OnePageComponent deletePage={props.deletePage} user={props.user} modify={props.modify} page={pages[index]} /></Row> : null}
        </Col>           
        <Col className='column'>
            <Container className="centered-container">
                {index < pages.length-1 ? <Button variant="outline-dark " className="btn-icon" onClick={addIndex}><i className="bi bi-arrow-right"></i></Button> : null}
            </Container>
        </Col>

        {props.modify ? 
        <Link to="/add">
            <Button variant="outline-dark fixed-right-bottom">Create a new page!</Button>
        </Link>
        : 
        null}

        </>
    );
}

function OnePageComponent(props){
    const page = props.page;

    const handleDelete = () =>{
        props.deletePage(props.page.id);
    }

    return (
        <>
        <Card className="w-100 padding-card">  
            { props.modify && (page.authorId==props.user.id || props.user.admin) ? <Card.Header className='text-end'> 
                    <Link to="/edit" state={{pageId: page.id}}><Button variant="outline-dark border-0" className="btn-icon"><i className="bi bi-pen"></i></Button></Link>
                    <Button onClick={handleDelete} variant="outline-dark border-0" className="btn-icon"><i className="bi bi-x-circle"></i></Button>
        
                </Card.Header> 
                : null}
            <Card.Header>{page.author} &nbsp; {page.dateOfCreation.format('DD-MM-YYYY')} &nbsp; {page.dateOfPublication.format('DD-MM-YYYY')}</Card.Header>
            <Card.Body> 
            <Card.Title className='content-title'>{page.title}</Card.Title> 
            {page.listContents.map((content) => {return <SingleContentBlock key={content.id} content={content}/>})} 
            </Card.Body>  
        </Card>
        </>

    );
}

function SingleContentBlock(props){
    const content = props.content;
    // header, paragraph, or image
    let ris;

    if(content && content.type == 'header'){
        ris = <Card.Title>{content.value}</Card.Title>;
    }
    else if(content && content.type == 'paragraph'){
        ris = <Card.Text>{content.value}</Card.Text>
    }
    else if(content && content.type == 'image'){
        ris = <Card.Img variant="top" src={content.value} />;
    }

    return(
        <>
        {ris}
        </>
    );
}

function EditPageComponent(props){

    const [id, setId] = useState(props.page ? props.page.id : -1);
    const [title, setTitle] = useState(props.page ? props.page.title : "Your title");
    const [authorId, setAuthorId] = useState (props.page ? props.page.authorId : props.user.id);
    const [author, setAuthor] = useState(props.page ? props.page.author : props.user.name); //di default user loggato
    const [creationDate, setCreationDate] = useState((props.page && props.page.dateOfCreation) ? props.page.dateOfCreation.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
    const [pubDate, setPubDate] = useState((props.page && props.page.dateOfPublication) ? props.page.dateOfPublication.format('YYYY-MM-DD') : "");
    const [modalShow, setModalShow] = useState(false);

    const [users, setUsers] = useState([]);

    const [notValidPage, setNotValidPage] = useState(false);

    const [contents, setContents] = useState(props.page ? [...props.page.listContents] : []);

    const [lastCId, setLastCId] = useState(props.page ? props.page.lastCId : 0);

    const navigate = useNavigate();

    const handleAddContent = (type) => {
        setContents([...contents, new Content(lastCId, type, type)]);
        setLastCId(lastCId+1);
    };

    const handleModifyContent = (contentvalue, contentId) => {
        let vet = [...contents];

        let index = contents.findIndex(content => content.id === contentId);

        vet[index].value = contentvalue;

        setContents(vet);
    }

    const handlePutImage = (pathImg) =>  {
        setContents([...contents, new Content(lastCId, 'image', pathImg)]);
        setLastCId(lastCId+1);
    }
    
    const handleUp = (contentId) => {
        let vet = [...contents];

        let index = contents.findIndex(content => content.id === contentId);

        let temp = vet[index-1];
        vet[index-1]=vet[index];
        vet[index]=temp;

        setContents(vet);
    }

    const handleDelete = (contentId) => {
        let updatedContents = [...contents];

        let index = contents.findIndex(content => content.id === contentId);

        updatedContents.splice(index, 1);

        setContents(updatedContents);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if(validConstraints()) {
            let page = new Page(id, title, 'author', authorId ,dayjs(creationDate), dayjs(pubDate), contents); 
            props.addPage(page);
        }
        else{
            setNotValidPage(true);
        }
    }

    const validConstraints = () => {
        const cHeaders = contents.filter((content) => content.type === 'header').length >= 1;
        const cOthers = contents.filter((content) => content.type !== 'header').length >= 1;
      
        if ((dayjs(pubDate).isValid() ? dayjs(pubDate) >= dayjs(creationDate) : 1) && cHeaders && cOthers) {
          return 1;
        } else {
          return 0;
        }
      };

    useEffect(() => {
        if(props.user.admin){
            API.getUsers()
            .then(users => {
                setUsers(users);
            })
            .catch(e => {
                handleErrors(e); 
                navigate('/');
            }); 
        }
    }, []);
      
    return (
    <>
    <Col xs={1}></Col>
    <Col xs={8}>
        {notValidPage ? <Alert dismissible variant="danger">The page is not valid</Alert> : null}
        <Card className="w-100">  
            <ListGroup className="list-group-flush">
                <Card.Header>{author} </Card.Header>
                <Card.Body> 
                <Card.Title className="content-title">{title}</Card.Title>
                {contents.map((content, index) => {return <ListGroup.Item key={content.id}><EditSingleContentBlock handleModifyContent={handleModifyContent} index={index} content={content} handleDelete={handleDelete} handleUp={handleUp}/></ListGroup.Item>})} 
                </Card.Body> 
            </ListGroup>
        </Card>
    </Col> 
    <Col>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" required={true} value={title} onChange={event => setTitle(event.target.value)}/>
            </Form.Group>

            {props.user.admin ? <>
                <Form.Group className="mb-3">
                    <Form.Label>Author</Form.Label>
                    <Form.Select value={authorId} onChange={event => {
                        setAuthorId(event.target.value);
                        }}>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                </> : null}

            <Form.Group className="mb-3">
                <Form.Label>Creation date</Form.Label>
                <Form.Control type="date" value={creationDate} disabled/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Publication date</Form.Label>
                <Form.Control type="date" required={false} value={pubDate} onChange={event => setPubDate(event.target.value)}/>
            </Form.Group>

            <Form.Group className="mb-3">
            <Row className="mb-3"><Button onClick={()=>handleAddContent('header')} variant="outline-dark">&lt;- Add header</Button></Row>
            <Row className="mb-3"><Button onClick={()=>handleAddContent('paragraph')} variant="outline-dark">&lt;- Add paragraph</Button></Row>
            <Row className="mb-3"><Button onClick={() =>setModalShow(true) } variant="outline-dark">&lt;- Add image</Button></Row>
            <Row className="mb-3"><Button variant="secondary" type="submit">{props.modify ? "Update page!" : "Create page!"}</Button></Row>
            <Row className="mb-3"><Button onClick={()=>{navigate(-1)}} variant="secondary">{props.modify ? "Delete changes!" : "Cancel"}</Button></Row> 
            </Form.Group> 
        </Form>
    </Col>

    <MyVerticallyCenteredModalForImages
        show={modalShow}
        onHide={() => setModalShow(false)}
        handlePutImage={handlePutImage}
        />
    </>
    
    );
}

function MyVerticallyCenteredModalForImages(props) {
    const [images, setImages] = useState([]);

    useEffect(() => {
        API.getImages()
        .then(newimages => {
            setImages(newimages);
        })
        .catch(e => {
            handleErrors(e); 
        }); 
    }, []);

    const handleButtonImage = (index) => {
        //event.preventDefault();
        
        props.handlePutImage(images[index]);
        props.onHide();    
    }

    return (
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered>

        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Select your image
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Row>
            {images.map((image,index) => (
            <Col key={index} sm={6} md={6} lg={6} xl={6}>
                <img src={image} onClick={()=>handleButtonImage(index)} alt="Button Image" className="img-fluid"/>
            </Col>
      ))}
    </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
}

function EditSingleContentBlock(props){

    const handleChange = (event) => {
        props.handleModifyContent(event.target.value, props.content.id);
    };
  
    let ris;

    if(props.content && props.content.type == 'header'){

        ris =  <Card.Title><textarea
            className="fw-bold content-input w-100"
            rows={1}
            value={props.content.value}
            onChange={handleChange}/>
        </Card.Title>
    }
    else if(props.content && props.content.type == 'paragraph'){

        ris =  <Card.Text><textarea
            className="card-text content-input w-100"
            rows={4}
            value={props.content.value}
            onChange={handleChange}/>
      </Card.Text>
    }
    else if(props.content && props.content.type == 'image'){
        ris = <Card.Img variant="top" src={props.content.value} />; 
    }

    return(
        <>
        {props.index == 0 ? null : 
        <Button onClick={() => props.handleUp(props.content.id)} variant="outline-dark border-0" className="btn-icon"><i className="bi bi-arrow-up-square"></i></Button>
        }
        <Button onClick={() => props.handleDelete(props.content.id)} variant="outline-dark border-0" className="btn-icon"><i className="bi bi-x-square"></i></Button>
        {ris}
        </>
    );
}

export {PageComponent, EditPageComponent};