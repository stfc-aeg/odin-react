import { Container, Row, Col, Stack, Form, Button, InputGroup, Alert, DropdownButton, Dropdown, FloatingLabel } from "react-bootstrap"
import { TitleCard, useAdapterEndpoint, WithEndpoint } from "../"
import type { ParamTree, Log} from "../";
import { useState } from "react";

const EndpointInput = WithEndpoint(Form.Control);
const EndpointButton = WithEndpoint(Button);
const EndpointDropdown = WithEndpoint(DropdownButton);

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
    logging_no_level: Log[]
}

export const EndpointPage: React.FC = () => {

    const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL);

    const [input, changeInput] = useState(0);
    const [formData, changeFormData] = useState<ParamTree>({});

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault(); // stops the submit event refreshing the page
        console.log(event);
        let target = event.target as HTMLFormElement;
        const formData = new FormData(target),
              formDataObj = Object.fromEntries(formData.entries()) as ParamTree;
        console.log(formDataObj);
        changeFormData(formDataObj);
    }

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        console.log(event);
        console.log(event.target);
        console.log(formData);

    }

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
                            <Form.Control placeholder="John" 
                            onChange={(e) => changeFormData(oldForm => Object.assign(oldForm, {first_name: e.target.value}))}/>
                        </FloatingLabel>
                        </Col>
                        <Col>
                        <FloatingLabel label="Last Name">
                            <Form.Control placeholder="Smith"
                            onChange={(e) => changeFormData(oldForm => Object.assign(oldForm, {last_name: e.target.value}))}/>
                        </FloatingLabel>
                        </Col>
                        <Col>
                        <FloatingLabel label="Age" controlId="age">
                            <Form.Control type="number" placeholder="42"
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
            </Row>
        </Container>
    )
}