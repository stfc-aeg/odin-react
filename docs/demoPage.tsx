import { TitleCard } from "../lib/components/TitleCard";
import { OdinGraph } from "../lib/components/OdinGraph";
import { EndpointButton, EndpointInput, EndpointDropdown } from "../lib/components/WithEndpoint";
import { Container, Row, Col, InputGroup, Form, Stack, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { AdapterEndpoint } from '../lib/components/AdapterEndpoint';
import { useState } from 'react';

import { EndpointData } from '../lib/components/AdapterEndpoint/index.mock';

interface DemoPageProps {
    endpoint: AdapterEndpoint<EndpointData>
}

const DemoPage = (
    { endpoint }: DemoPageProps
) => {

    const [triggeredStateMessage, changeMessage] = useState("Default\nNot Yet Set");

    const [input, changeInput] = useState(endpoint.data.string_val ?? "");

    const PreMethod = () => {
        changeMessage("Trigger Clicked\nAwaiting Data");
    }

    const PostMethod = (num: number) => {
        changeMessage("Post Method\nNumber: " + num);
    }

    return (
        <Container>
            <Row>
                <br />
            </Row>
            <Row>
                <Col>
                    <Stack>
                        <TitleCard title="Click Button">
                            <InputGroup>
                                <InputGroup.Text>Trigger</InputGroup.Text>
                                <EndpointButton endpoint={endpoint} fullpath='trigger' value={42}
                                    pre_method={PreMethod} post_method={PostMethod}
                                    post_args={[endpoint.data.rand_num]}>
                                    Click me!
                                </EndpointButton>
                                <Form.Control as="textarea" readOnly value={triggeredStateMessage} />
                            </InputGroup>
                        </TitleCard>
                        <TitleCard title="Inputs">
                            <InputGroup>
                                <InputGroup.Text>Enter Value:</InputGroup.Text>
                                <EndpointInput endpoint={endpoint} fullpath="num_val" type="number" />
                            </InputGroup>
                            <InputGroup>
                                <InputGroup.Text>Enter String:</InputGroup.Text>
                                <EndpointInput endpoint={endpoint} fullpath="deep/long/nested/path/val" />
                            </InputGroup>
                        </TitleCard>
                        <TitleCard title="Button Value Controlled by Input">
                            <InputGroup>
                                <InputGroup.Text>Enter Value</InputGroup.Text>
                                <Form.Control value={input} onChange={(event) => changeInput(event.target.value)} />
                                <EndpointButton endpoint={endpoint} fullpath="string_val" value={input}>
                                    Submit Value
                                </EndpointButton>
                            </InputGroup>
                        </TitleCard>
                        <TitleCard title="Using a Tooltip">
                            <OverlayTrigger overlay={<Tooltip id="demo-tooltip">Float Value</Tooltip>}>
                                <EndpointInput endpoint={endpoint} fullpath='float_val' step={0.5} />
                            </OverlayTrigger>
                        </TitleCard>
                    </Stack>
                </Col>
                <Col>
                    <Stack>
                        <TitleCard>
                            <Stack>
                                <OdinGraph data={endpoint.data.graph_data ?? [0]} title="Demo Graph" />
                            </Stack>
                        </TitleCard>
                        <TitleCard title="Dropdown">
                            <InputGroup>
                                <InputGroup.Text>Select Option</InputGroup.Text>
                                <EndpointDropdown endpoint={endpoint} fullpath="selected" />
                            </InputGroup>
                        </TitleCard>
                    </Stack>
                </Col>
            </Row>
        </Container>
    )
}

export { DemoPage };