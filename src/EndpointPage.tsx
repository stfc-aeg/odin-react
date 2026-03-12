import { Container, Row, Col, Stack, Form, InputGroup, Alert, Dropdown, FloatingLabel } from "react-bootstrap"
import { TitleCard, WithEndpoint, OdinDoubleSlider } from "../"
import { EndpointInput, EndpointSlider, EndpointDoubleSlider, EndpointButton, EndpointDropdown, EndpointCheckbox } from "../";
import type { ParamNode, Log} from "../";
import { useState } from "react";
import { AdapterEndpoint } from "../";

import type { ReactNode } from "react";

const OldEndpointInput = WithEndpoint(Form.Control);
const EndpointSelect = WithEndpoint((props: React.HTMLAttributes<HTMLSelectElement>) => (<select {...props}>{props.children as ReactNode}</select>))

interface FormData_T extends ParamNode{
    first_name: string;
    last_name: string;
    age: number;
}

export interface EndpointData extends ParamNode{
    string_val: string;
    num_val: number;
    float_val: number;
    rand_num: number;
    selected: string;
    toggle: boolean;
    trigger: null;
    data: {
        set_data: number;
        dict: {
            half: number;
            is_even: boolean;
        },
        clip_data: number[];
    };
    deep: {
        long: {
            nested: {
                dict: {
                    path: {
                        val: string;
                        num_val: number;
                    }
                }
            }
        }
    };
    logging: Log[];
    logging_no_level: Log[];
    submit: FormData_T;
}



export const EndpointPage: React.FC<{endpoint: AdapterEndpoint<EndpointData>}> = ({endpoint}) => {

    const [input, changeInput] = useState(0);
    const [formData, changeFormData] = useState<FormData_T>({first_name: "", last_name: "", age: 0});

    const testFunc = (comment: string) => {
        console.log(comment);
    }

    const secondTestFunc = () => {
        console.log("Second Test Funciton");
    }

    return (
        <Container>
            <Row>
                <Col>
                    <TitleCard title="Click Button">
                        <Stack>
                            <EndpointButton endpoint={endpoint} fullpath="trigger" value={42}
                                pre_method={testFunc} pre_args={["Hello World"]}
                                post_method={secondTestFunc}>
                                Trigger New Button
                            </EndpointButton>
                            <EndpointInput endpoint={endpoint} fullpath="num_val"/>
                            <Form.Label>{`Slider Val: ${endpoint.data.num_val ?? "Unknown"}`}</Form.Label>
                            <EndpointSlider endpoint={endpoint} fullpath="num_val"/>
                            <OldEndpointInput endpoint={endpoint} fullpath="num_val" type="number"/>
                            <EndpointCheckbox type="switch" label="Toggle" endpoint={endpoint} fullpath="toggle"/>
                            <EndpointCheckbox type="checkbox" label="Toggle" endpoint={endpoint} fullpath="toggle"/>
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
                        <EndpointButton endpoint={endpoint} fullpath="trigger" value={10} disabled={endpoint.data.data?.dict.is_even}>
                                    Disabled on Even
                        </EndpointButton>
                        <EndpointButton endpoint={endpoint} fullpath="num_val">
                            Click For Num Val
                        </EndpointButton>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Dropdown Test">
                        <Stack>
                        <EndpointDropdown endpoint={endpoint} fullpath="selected"
                            title={endpoint.data.selected || "Unknown"}>
                                {endpoint.metadata?.selected?.allowed_values ? endpoint.metadata.selected.allowed_values.map(
                                    (selection, index) => (
                                        <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
                                    )): <></>
                                }
                        </EndpointDropdown>
                        <label>Choose Option:
                            <EndpointSelect endpoint={endpoint} fullpath="selected">
                                {endpoint.metadata?.selected?.allowed_values ? endpoint.metadata.selected.allowed_values.map(
                                    (selection, index) => {
                                        return <option key={index} value={selection}>{selection}</option>;
                                }) : <option value="">Unknown</option>
                                    }
                            </EndpointSelect>
                        </label>

                        <Form>
                            <EndpointCheckbox endpoint={endpoint} fullpath={"selected"}
                                type="radio" name="radio-group" value="item 1" label="Item One"/>
                            <EndpointCheckbox endpoint={endpoint} fullpath={"selected"}
                                type="radio" name="radio-group" value="item 2" label="Item Two"/>
                            <EndpointCheckbox endpoint={endpoint} fullpath={"selected"}
                                type="radio" name="radio-group" value="item 3" label="Item Three"/>
                        </Form>

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
                    <EndpointButton endpoint={endpoint} fullpath="num_val" value={input}>
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
                    <EndpointButton endpoint={endpoint} fullpath="submit" value={formData}>
                    Submit Form Data 
                    </EndpointButton>
                </TitleCard>
                </Col>
                <Col>
                <TitleCard title="Error Handling">
                    <EndpointButton endpoint={endpoint} fullpath="invalid" value="true">
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
                    <EndpointDoubleSlider title="Endpoint Slider" endpoint={endpoint} fullpath="data/clip_data" min={-20} max={20} step={0.5}/>
                    <OdinDoubleSlider showTooltip={false} showMinMaxValues={true}/>
                    <OdinDoubleSlider showMinMaxValues={false}/>
                    <OdinDoubleSlider/>
                </TitleCard>
                </Col>
            </Row>
        </Container>
    )
}