import { ParamController } from "../";

import { Container, Row, Col } from "react-bootstrap";

import type { AdapterEndpoint_t } from "../";


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