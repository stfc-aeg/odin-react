import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import React, { useState, useEffect } from "react";

function OdinForm(props) {

    const inputs = props.inputs;
    const [listInputs, changeInputs] = useState(<></>);

    const getFormType = (inputVal) => {
        if(inputVal.type){
            return inputVal.type;
        }
        else{
            return typeof(inputVal.defaultValue);
        }

    };

    const onChangeHandler = (endpoint, path, val) =>
    {
        console.log(`Endpoint: ${endpoint}\n Path: ${path}\n Value: ${val}`);
        let param = "";
        let paramPath = "";

        if(path.includes("/"))
        {
            [paramPath, param] = path.split(/\/(?!.*\/)(.*)/, 2);
        }else{
            param = path;
        }

        const data = {[param]: val};
        // data[param] = val;
        console.log(data);
        console.log(paramPath);
        endpoint.put(data, paramPath);
    }

    useEffect(() => 
    {
        changeInputs(inputs.map((inputVal) => {
            // console.log(inputVal);
            const endpoint = inputVal.endpoint;
            const path = inputVal.path;
            // console.log(endpoint);
            // console.log(path);
            // const indivChangeHandler = e => onChangeHandler(endpoint, path, e);
            switch(getFormType(inputVal))
            {
                // case "boolean":
                //     return (
                //         <></>
                //     )
                case "number":
                    const overlay = <Tooltip id={`tooltip-${inputVal.id}`}>{inputVal.label}</Tooltip>
                    return (
                        
                        <Col className="g-0">
                            <OverlayTrigger placement="top" overlay={overlay}>
                            <FloatingLabel controlId={inputVal.id} label={inputVal.label}>
                                {/* <Form.Label>{inputVal.label}</Form.Label> */}
                                <Form.Control 
                                type="number"
                                defaultValue={inputVal.defaultValue || 0}
                                onChange={val => onChangeHandler(endpoint, path, parseInt(val.target.value))}
                                />
                            </FloatingLabel>
                            </OverlayTrigger>
                        </Col>
                    )
    
                case "range":
                    return (
                        <Form.Group controlID={inputVal.id}>
                            <Form.Label>{inputVal.label}</Form.Label>
                            <Form.Range
                            min={inputVal.min}
                            max={inputVal.max}
                            onChange={val => onChangeHandler(endpoint, path, parseInt(val.target.value))}
                            />
                        </Form.Group>
                    )
                case "string":
                default:
                    return (
                        <Form.Group controlID={inputVal.id}>
                            <Form.Label>{inputVal.label}</Form.Label>
                            <Form.Control
                            type="text"
                            onChange={val => onChangeHandler(endpoint, path, val.target.value)}
                            />
                        </Form.Group>
                    )
            }
        }));
    }, [inputs]);
    

    return (
        <Form>
            <Container>
                <Row>{listInputs}</Row>
            </Container>
        
        </Form>
    );
}

export default OdinForm;