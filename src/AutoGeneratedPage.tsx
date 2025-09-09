import { ParamController } from "../";

import { Container, Row, Col, InputGroup, Alert, Form } from "react-bootstrap";
import { TitleCard, WithEndpoint } from "../";

import type { AdapterEndpoint_t } from "../";

const EndpointInput = WithEndpoint(Form.Control);

interface AutoGenPageProps {
    endpoint: AdapterEndpoint_t;
}
 
const AutoGenPage: React.FC<AutoGenPageProps> = (
    {endpoint}
) => {
    return ( 
        <Container>
            <Row>
                <Col>
                <ParamController endpoint={endpoint} title="React Adapter"/>
                </Col>
            </Row>
        </Container>
     );
}

 
 
export default AutoGenPage;