import {Container, Row, Col } from 'react-bootstrap';

import { OdinEventLog, useAdapterEndpoint } from '../';

import { EndpointData_t } from './EndpointPage';


export const LogMessagePage = () => {

    const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL);

    
    return (
        <Container>
            <Row>
            <Col>
                <OdinEventLog events={endpoint.data.logging ?? []} endpoint={endpoint} path="logging" maxLogs={100}/>
            </Col>
            <Col>
                <OdinEventLog events={endpoint.data.logging_no_level ?? []} endpoint={endpoint} path="logging_no_level"
                refreshRate={2000} displayHeight={440}/>
            </Col>
            </Row>
        </Container>
    )
}