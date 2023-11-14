import { useState } from 'react';
import { Form, Button, Alert, Col, Row, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function SettingsForm(props) {
    const navigate = useNavigate();
    const [title, setTitle] = useState(props.title);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () =>{
        event.preventDefault();
        setLoading(true);
        props.updateTitle(title);
    }

    return (
        <Row className="vh-100 justify-content-center align-items-center">
            <Col md={4}>
                <Card className="rounded">
                <Card.Body>
                    <h1 className="pb-3">Settings</h1>
                    <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="movieTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                        type="text"
                        disabled={loading}
                        value={title}
                        onChange={(ev) => setTitle(ev.target.value)}
                        required={true}
                        />
                    </Form.Group>
                    <Button disabled={loading} className="mt-3" type="submit">
                        Save
                    </Button>
                    </Form>
                </Card.Body>
                </Card>
            </Col>
        </Row>
    );

}

export {SettingsForm};
