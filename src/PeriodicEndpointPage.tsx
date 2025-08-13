import { Container, Row, Col, Stack, Form, Button, InputGroup, Alert, DropdownButton, Dropdown } from "react-bootstrap"
import { TitleCard, useAdapterEndpoint, WithEndpoint } from "../"

const EndpointInput = WithEndpoint(Form.Control);
const EndpointButton = WithEndpoint(Button);
const EndpointDropdown = WithEndpoint(DropdownButton);

import { EndpointData_t } from "./EndpointPage";

export const PeriodicEndpointPage: React.FC = () => {

    const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL, 1000);

    return (
        <Container>
            <Row>
                <Col>
                    <TitleCard title="Click Button">
                        <Stack>
                            <EndpointButton endpoint={endpoint} fullpath="trigger" event_type="click" value={42}>
                                Trigger
                            </EndpointButton>
                            <EndpointInput endpoint={endpoint} fullpath="num_val" type="number"/>
                            <EndpointInput endpoint={endpoint} fullpath="rand_num" type="number"/>
                        </Stack>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Wider Param Tree Effects">
                        <InputGroup>
                        <InputGroup.Text>Enter Value:</InputGroup.Text>
                        <EndpointInput endpoint={endpoint} fullpath="data/set_data" type="number"/>
                        </InputGroup>
                        <InputGroup><InputGroup.Text>Half</InputGroup.Text>
                        <EndpointInput endpoint={endpoint} fullpath="data/dict/half"/>
                        </InputGroup>
                        {/* <Alert>Half: {endpoint.data.data?.dict?.half}</Alert> */}
                        <Alert>Is Even: {endpoint.data.data?.dict?.is_even?.toString()}</Alert>
                        <EndpointButton endpoint={endpoint} event_type="click" fullpath="trigger" value={10} disabled={endpoint.data.data?.dict.is_even}>
                                    Disabled on Even
                        </EndpointButton>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Dropdown Test">
                        <Stack>
                        <EndpointDropdown endpoint={endpoint} event_type="select" fullpath="selected"
                            title={endpoint.data.selected || "Unknown"}>
                                {endpoint.data.select_list ? endpoint.data.select_list.map(
                                    (selection, index) => (
                                        <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
                                    )): <></>
                                }
                        </EndpointDropdown>
                        <EndpointInput endpoint={endpoint} fullpath="deep/long/nested/dict/path/val" />
                        </Stack>
                    </TitleCard>
                </Col>
            </Row>
            <Row>
                <Col>
                <TitleCard title="Duplicate Input Test">
                    <InputGroup>
                    <InputGroup.Text>Enter Value:</InputGroup.Text>
                    <EndpointInput endpoint={endpoint} fullpath="deep/long/nested/dict/path/num_val" type="number"/>
                    <InputGroup.Text>This one should match</InputGroup.Text>
                    <EndpointInput endpoint={endpoint} fullpath="deep/long/nested/dict/path/num_val" type="number"/>
                    </InputGroup>
                </TitleCard>
                </Col>
            </Row>
        </Container>
    )
}