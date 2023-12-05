import React, {useState} from 'react';

import Container from 'react-bootstrap/Container';
import { TitleCard, DropdownSelector, StatusBox, OdinDoubleSlider } from 'odin-react';
import { WithEndpoint, useAdapterEndpoint, ToggleSwitch } from 'odin-react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown'
import { InputGroup } from 'react-bootstrap';


const EndpointDropdown = WithEndpoint(DropdownSelector);
const EndpointButton = WithEndpoint(Button);
const EndpointInput = WithEndpoint(Form.Control);
const EndpointToggleButton = WithEndpoint(ToggleSwitch);
const EndpointDoubleSlider = WithEndpoint(OdinDoubleSlider);


function EndpointExamplePage(props) {
    const {postPutMethod} = props;
    
    const staticEndpoint = useAdapterEndpoint("react", process.env.REACT_APP_ENDPOINT_URL);
    const periodicEndpoint = useAdapterEndpoint("react", process.env.REACT_APP_ENDPOINT_URL, 1000);
    

    // console.log(staticEndpoint.data)

    const [data, changeData] = useState(100);

    const onChangeData = (event) => {
        console.log(event);
        changeData(+event.target.value);
    }

    const onSliderChange = (event) => {
        console.log(event);
    }

    const prePutMethod = (message) => {
        console.log("Pre Message: %s", message);
    }

    return (
        <Container>
            <Row>
            <Col>
                <TitleCard title="Periodic Endpoint">
                    <Row>
                        <Col>
                            <TitleCard title="Textbox">
                                
                                <InputGroup>
                                    <InputGroup.Text>Enter Text:</InputGroup.Text>
                                    <EndpointInput endpoint={periodicEndpoint} event_type="change" fullpath="string_val"/>
                                </InputGroup>
                                <StatusBox label="API Text Value">{periodicEndpoint.data?.string_val || "Disconnected"}</StatusBox>

                                <InputGroup>
                                    <InputGroup.Text>Enter Number:</InputGroup.Text>
                                    <EndpointInput endpoint={periodicEndpoint} event_type="change" type="number" fullpath="num_val"/>
                                </InputGroup>
                                
                            </TitleCard>
                        </Col>
                        <Col>
                            <Row>
                                <Col xs={5}>
                                    <TitleCard title="Dropdown">
                                        <EndpointDropdown endpoint={periodicEndpoint} event_type="select" fullpath="selected" 
                                        buttonText={periodicEndpoint.data?.selected || "Unknown"}>
                                            {periodicEndpoint.data?.select_list ? periodicEndpoint.data.select_list.map(
                                                (selection, index) => (
                                                    <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
                                                )) : <></>
                                            }
                                        </EndpointDropdown>
                                    </TitleCard>
                                </Col>
                                <Col>
                                    <TitleCard title="Toggle">
                                            <EndpointToggleButton endpoint={periodicEndpoint} event_type="click" label="toggle"
                                            fullpath="toggle" checked={periodicEndpoint.data?.toggle || false} value={periodicEndpoint.data?.toggle || false}/>
                                    </TitleCard>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={5}>
                                    <TitleCard title="Button">
                                        <EndpointButton endpoint={periodicEndpoint} event_type="click" fullpath="trigger" value={42} 
                                        pre_method={prePutMethod} pre_args={["Test", 42]}>Trigger</EndpointButton>
                                    </TitleCard>
                                </Col>
                                <Col>
                                    <TitleCard title="Nested Value">
                                        <InputGroup>
                                            {/* <InputGroup.Text>Enter Text:</InputGroup.Text> */}
                                            <EndpointInput endpoint={periodicEndpoint} event_type="change" fullpath="deep/long/nested/dict/path/val"/>
                                        </InputGroup>
                                    </TitleCard>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <TitleCard title="Wider Param Tree Effects">
                                <InputGroup>
                                <InputGroup.Text>Enter Value:</InputGroup.Text>
                                <EndpointInput endpoint={periodicEndpoint} event_type="change" fullpath="data/set_data"/>
                                </InputGroup>
                                <StatusBox label="Half">{periodicEndpoint.data?.data?.dict.half}</StatusBox>
                                <StatusBox label="Is Even">{periodicEndpoint.data?.data?.dict.is_even}</StatusBox> 
                                <EndpointButton endpoint={periodicEndpoint} event_type="click" fullpath="trigger" value={10} disabled={periodicEndpoint.data?.data?.dict.is_even}>
                                    Disabled on Even
                                </EndpointButton>
                            </TitleCard>
                        </Col>
                    </Row>
                </TitleCard>
            </Col>
            </Row>
            <Row>
            <Col>
                <TitleCard title="Static Endpoint">
                <Row>
                        <Col>
                            <TitleCard title="Textbox">
                                
                                <InputGroup>
                                    <InputGroup.Text>Enter Text:</InputGroup.Text>
                                    <EndpointInput endpoint={staticEndpoint} event_type="change" fullpath="string_val"/>
                                </InputGroup>
                                <InputGroup>
                                    <InputGroup.Text>Enter Text:</InputGroup.Text>
                                    <EndpointInput endpoint={staticEndpoint} event_type="change" fullpath="string_val"/>
                                </InputGroup>
                                <StatusBox label="API Text Value">{staticEndpoint.data?.string_val || "Disconnected"}</StatusBox>

                                <InputGroup>
                                    <InputGroup.Text>Enter Number:</InputGroup.Text>
                                    <Form.Control type="number" onChange={onChangeData}/>
                                    <EndpointButton endpoint={staticEndpoint} event_type="click" fullpath="num_val" value={data}>
                                        Send Data
                                    </EndpointButton>
                                    {/* <EndpointInput endpoint={staticEndpoint} event_type="change" type="number" fullpath="num_val"/> */}
                                </InputGroup>
                                
                            </TitleCard>
                        </Col>
                        <Col>
                            <Row>
                                <Col xs={5}>
                                    <TitleCard title="Dropdown">
                                        <EndpointDropdown endpoint={staticEndpoint} event_type="select" fullpath="selected" 
                                        buttonText={staticEndpoint.data?.selected || "Unknown"}>
                                            {staticEndpoint.data?.select_list ? staticEndpoint.data.select_list.map(
                                                (selection, index) => (
                                                    <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
                                                )) : <></>
                                            }
                                        </EndpointDropdown>
                                    </TitleCard>
                                </Col>
                                <Col>
                                    <TitleCard title="Toggle">
                                            <EndpointToggleButton endpoint={staticEndpoint} event_type="click" label="toggle"
                                            fullpath="toggle" checked={staticEndpoint.data?.toggle || false} value={staticEndpoint.data?.toggle || false}/>
                                    </TitleCard>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={5}>
                                    <TitleCard title="Button">
                                        <EndpointButton endpoint={staticEndpoint} event_type="click" fullpath="trigger" value={42}
                                                        post_method={postPutMethod}>Trigger</EndpointButton>
                                    </TitleCard>
                                </Col>
                                <Col>
                                    <TitleCard title="Nested Value">
                                        <InputGroup>
                                            {/* <InputGroup.Text>Enter Text:</InputGroup.Text> */}
                                            <EndpointInput endpoint={staticEndpoint} event_type="change" fullpath="deep/long/nested/dict/path/val"/>
                                        </InputGroup>
                                    </TitleCard>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <TitleCard title="Wider Param Tree Effects">
                                <InputGroup>
                                <InputGroup.Text>Enter Value:</InputGroup.Text>
                                <EndpointInput endpoint={staticEndpoint} event_type="change" fullpath="data/set_data" />
                                </InputGroup>
                                <InputGroup>
                                <InputGroup.Text>Enter Value:</InputGroup.Text>
                                <EndpointInput endpoint={staticEndpoint} event_type="change" fullpath="data/set_data" />
                                </InputGroup>
                                <StatusBox label="Half">{staticEndpoint.data.data?.dict.half}</StatusBox>
                                <StatusBox label="Is Even" type={staticEndpoint.data.data?.dict.is_even ? "success" : "danger"}>{staticEndpoint.data.data?.dict.is_even}</StatusBox>
                            </TitleCard>
                        </Col>
                    </Row>
                </TitleCard>
                
            </Col>
            </Row>
            <Row>
                <Col>
                    <TitleCard title="Slider Test">
                        <Row>
                        <Col>
                        <OdinDoubleSlider min={10} max={20} steps={0.5} onChange={onSliderChange}
                            showMinMaxLabels={false} tooltipPosition="bottom" disabled/>
                        </Col>
                        <Col>
                        <EndpointDoubleSlider endpoint={staticEndpoint} event_type="change" delay={0} fullpath="data/clip_data" title="Clip Data" showTitle={false}/>
                        </Col>
                        <Form.Range/>
                        </Row>
                    </TitleCard>
                </Col>
            </Row>
        </Container>
    )
}

export default EndpointExamplePage;