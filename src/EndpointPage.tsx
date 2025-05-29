import { Container, Row, Col, Stack, Form, Button, InputGroup, Alert, DropdownButton, Dropdown, FloatingLabel } from "react-bootstrap"
import { TitleCard, WithEndpoint, OdinDoubleSlider } from "../"
import type { ParamTree, Log} from "../";
import { useState } from "react";
import { AdapterEndpoint_t } from "../dist/types";

const EndpointInput = WithEndpoint(Form.Control);
const EndpointButton = WithEndpoint(Button);
const EndpointDropdown = WithEndpoint(DropdownButton);
const EndpointSlider = WithEndpoint(OdinDoubleSlider);

interface FormData_T extends ParamTree{
    first_name: string;
    last_name: string;
    age: number;
}

export interface EndpointData_t extends ParamTree{
    string_val: string,
    num_val: number,
    rand_num: number,
    select_list: string[],
    selected: string,
    toggle: boolean,
    trigger: null,
    data: {
        set_data: number,
        dict: {
            half: number,
            is_even: boolean
        },
        clip_data: number[]
    },
    deep: {
        long: {
            nested: {
                dict: {
                    path: {
                        val: string,
                        num_val: number
                    }
                }
            }
        }
    },
    logging: Log[],
    logging_no_level: Log[],
    submit: FormData_T;
}



export const EndpointPage: React.FC<{endpoint: AdapterEndpoint_t<EndpointData_t>}> = ({endpoint}) => {

    // const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL, undefined, 1000);

    const [input, changeInput] = useState(0);
    const [formData, changeFormData] = useState<FormData_T>({first_name: "", last_name: "", age: 0});


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
                <Col>
                <TitleCard title="Button Value Controlled by Input">
                    <InputGroup>
                    <InputGroup.Text>Enter Value</InputGroup.Text>
                    <Form.Control type="number" value={input} onChange={(event) => changeInput(Number(event.target.value))}/>
                    <EndpointButton endpoint={endpoint} fullpath="num_val" event_type="click" value={input}>
                        Submit Value
                    </EndpointButton>
                    </InputGroup>
                </TitleCard>
                </Col>
            </Row>
            <Row>
                <Col>
                <TitleCard title="Multiple Value Submit">
                    <Form>
                        <Row>
                            <Col>
                        <FloatingLabel label="First Name">
                            <Form.Control placeholder="John" defaultValue={endpoint.data.submit?.first_name ?? ""}
                            onChange={(e) => changeFormData(oldForm => Object.assign(oldForm, {first_name: e.target.value}))}/>
                        </FloatingLabel>
                        </Col>
                        <Col>
                        <FloatingLabel label="Last Name">
                            <Form.Control placeholder="Smith" defaultValue={endpoint.data.submit?.last_name ?? ""}
                            onChange={(e) => changeFormData(oldForm => Object.assign(oldForm, {last_name: e.target.value}))}/>
                        </FloatingLabel>
                        </Col>
                        <Col>
                        <FloatingLabel label="Age" controlId="age">
                            <Form.Control type="number" placeholder="42" defaultValue={endpoint.data.submit?.age ?? 0}
                            onChange={(e) => changeFormData(oldForm => Object.assign(oldForm, {age: Number(e.target.value)}))}/>
                        </FloatingLabel>
                        </Col>
                        </Row>
                        
                    </Form>
                    <EndpointButton endpoint={endpoint} fullpath="submit" value={formData} event_type="click">
                    Submit Form Data 
                    </EndpointButton>
                </TitleCard>
                </Col>
                <Col>
                <TitleCard title="Error Handling">
                    <EndpointButton endpoint={endpoint} fullpath="invalid" value="true" event_type="click">
                        This button PUTs to an address that does not exist
                    </EndpointButton>
                    <EndpointInput endpoint={endpoint} fullpath="slow_put" type="number" />
                </TitleCard>
                </Col>
            </Row>
            <Row>
                <Col>
                <TitleCard title="Slider">
                    <OdinDoubleSlider title="Test" showMinMaxValues={false}/>
                    <EndpointSlider title="Endpoint Slider" endpoint={endpoint} fullpath="data/clip_data" min={-20} max={20} step={0.5}/>
                    <OdinDoubleSlider showTooltip={false} showMinMaxValues={true}/>
                    <OdinDoubleSlider showMinMaxValues={false}/>
                </TitleCard>
                </Col>
            </Row>
        </Container>
    )
}