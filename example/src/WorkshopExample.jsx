import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import { TitleCard } from 'odin-react';

function WorkshopExamplePage(props){

    return (
        <Container>
            <Row>
            <Col>
                <TitleCard title="Workshop">
                    Use the space below this card as a practice space.
                </TitleCard>
            </Col>
            <Row>
                <Col>
                <TitleCard title="Test Title">
                    Example Text. This can be plain text and/or additional JSX components.
                </TitleCard>
                </Col>
                <Col></Col>
                {/* Comments like this can be included within the JSX markup */}
            </Row>
            </Row>
        </Container>
    )
}

export default WorkshopExamplePage;