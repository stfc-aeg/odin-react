import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Table from 'react-bootstrap/Table';

import * as Icon from 'react-bootstrap-icons';

import React, { useState } from 'react';
import OdinToggleButtons from './OdinToggleButtons';

function ControlCard(props) {

    const specEndpoint = props.specEndpoint;
    const acqEndpoint = props.acqEndpoint;

    const binningModeButtons = [
      {id: "bin-mode-full", value: "FullSensor", text:"Full Sensor"},
      {id: "bin-mode-bin", value: "BinnedSensor", text:"Full Sensor (Binned)"},
      {id: "bin-mode-row", value: "LineSensor", text:"Rows Binned"},
    ]

    const photoModeButtons = [
      {id: "acq-mode-photo", value: true, text:"Photoluminescence Mode"},
      {id: "acq-mode-thermo", value: false, text:"Thermoluminescence Mode"}
    ]

    return (
      <Card>
        <Card.Header>{props.title}</Card.Header>
        <Card.Body>
          <Container>
            <Row className="mb-2">
              <Col>
                <ButtonGroup size='lg'>
                  <Button >Begin Acquisition</Button>
                  <Button disabled>Stop Acquisition</Button>
                </ButtonGroup>
              </Col>
              <Col>
                <Button disabled>Begin Cooldown</Button>
              </Col>
            </Row>
            <Row className="mb-2">
              <OdinToggleButtons
              name="photoModeButtons"
              endpoint={acqEndpoint}
              path="photo_lum_mode"
              buttons={photoModeButtons}
              />
                {/* <ToggleButtonGroup type='radio' name='acq-mode' defaultValue="photo" onChange={handleModeChange}>
                  <ToggleButton id="acq-mode-photo" value="photo" variant='outline-primary'>
                    Photoluminescence Mode
                  </ToggleButton>
                  <ToggleButton id="acq-mode-thermo" value="thermo" variant='outline-primary'>
                    Thermoluminescence Mode
                  </ToggleButton>
                </ToggleButtonGroup> */}
            </Row>
            <Row>
              <Col>
                <OdinToggleButtons
                name="binModeButtons"
                endpoint={specEndpoint}
                path="binning/binning_mode"
                buttons={binningModeButtons}
                />
                <hr />
                <InputGroup>
                    <InputGroup.Text id='lbl-row-bin-size'>Row Bin Size</InputGroup.Text>
                    <Form.Control type='number'/>
                    <InputGroup.Text id='lbl-col-bin-size'>Column Bin Size</InputGroup.Text>
                    <Form.Control type='number'/>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text id="lbl-line-bin-size">Line Bin Count</InputGroup.Text>
                    <Form.Control type='number'/>
                </InputGroup>
                <InputGroup className="mt-2">
                    <InputGroup.Text id='lbl-exposure'>Exposure</InputGroup.Text>
                    <Form.Control type='number'/>
                    <Form.Select aria-label="Select Exposure timescale">
                        <option selected value="1">Milliseconds</option>
                        <option value="1000">Seconds</option>
                        <option value="60000">Minutes</option>
                    </Form.Select>
                </InputGroup>
              </Col>
              <Col>
                <ButtonGroup>
                    <Button variant='secondary'><Icon.ArrowRepeat/></Button>
                    <DropdownButton variant='secondary' id='btn-select-temp-steps' title="Select List of Temperature Steps">
                        <Dropdown.Item>Test</Dropdown.Item>
                        <Dropdown.Item>Cold</Dropdown.Item>
                    </DropdownButton>
                </ButtonGroup>
                <Table>
                    <thead>
                        <tr>
                            <th>Temperature(K)</th>
                        </tr>
                    </thead>
                </Table>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    )
  }

  export default ControlCard;