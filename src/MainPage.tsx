import { Container, Row, Col } from "react-bootstrap"
import { TitleCard } from "../"

export const MainPage: React.FC = () => {


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