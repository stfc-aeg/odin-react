import {Container, Row, Col } from 'react-bootstrap';

import { OdinEventLog, OdinTable, OdinTableRow, TitleCard, useAdapterEndpoint } from '../';

import { EndpointData_t } from './EndpointPage';


export const LogMessagePage = () => {

    const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL);

    const tableData = endpoint.data.logging?.slice(0, 10).map((log) => {
        return {"timestamp": log.timestamp, "message": log.message, "level": log.level}
    }) || [];

    
    
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
            <Row>
            <Col>
                <TitleCard title="Table Test">
                    <OdinTable columns={{"timestamp": "Timestamp", "message": "Message", "level": "Level"}}
                               striped hover>
                        {tableData.map((log) => (
                            <OdinTableRow key={log.timestamp} row={log}/>
                        ))}
                    </OdinTable>
                </TitleCard>
            </Col>
            </Row>
        </Container>
    )
}