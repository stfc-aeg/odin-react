import { Container, Row, Col, Stack, Form, Button, InputGroup, Alert, DropdownButton } from "react-bootstrap"
import { TitleCard, useAdapterEndpoint, WithEndpoint } from "../"

const EndpointInput = WithEndpoint(Form.Control);
const EndpointButton = WithEndpoint(Button);

export const EndpointPage: React.FC = () => {

    const endpoint = useAdapterEndpoint("react", import.meta.env.VITE_ENDPOINT_URL);

    return (
        <Container>
            <Row>
                <Col>
                    <TitleCard title="Click Button">
                        <Stack>
                            <EndpointButton endpoint={endpoint} fullpath="trigger" event_type="click" value={42}>
                                Trigger
                            </EndpointButton>
                            <EndpointInput endpoint={endpoint} fullpath="data/set_data"/>
                        </Stack>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Wider Param Tree Effects">
                        <InputGroup>
                        <InputGroup.Text>Enter Value:</InputGroup.Text>
                        <EndpointInput endpoint={endpoint} fullpath="data/set_data" type="number"/>
                        </InputGroup>
                        <Alert>Half: {endpoint.data.data?.dict?.half}</Alert>
                        <Alert>Is Even: {endpoint.data.data?.dict?.is_even?.toString()}</Alert>
                        <EndpointButton endpoint={endpoint} event_type="click" fullpath="trigger" value={10} disabled={endpoint.data?.data?.dict.is_even}>
                                    Disabled on Even
                                </EndpointButton>
                        <EndpointInput endpoint={endpoint} fullpath="test"/>
                    </TitleCard>
                </Col>
            </Row>
        </Container>
    )
}