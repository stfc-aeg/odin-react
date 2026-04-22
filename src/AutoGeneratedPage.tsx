import { ParamController } from "odin-react";

import { Container, Row, Col } from "react-bootstrap";

import type { AdapterEndpoint } from "odin-react";


interface AutoGenPageProps {
    endpoint: AdapterEndpoint;
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