import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Table from 'react-bootstrap/Table';
import ToggleSwitch from './ToggleSwitch';

import * as Icon from 'react-bootstrap-icons';

import React, { useState } from 'react';
import OdinEndpointToggleButtons from './OdinToggleButtons';
import WithEndpoint from '../services/withEndpoint';
import {OdinForm} from 'odin-react';

const EndpointButton = WithEndpoint(Button);

function ControlCard(props) {

    const specEndpoint = props.specEndpoint;
    const acqEndpoint = props.acqEndpoint;

    const binningModeButtons = [
      {id: "bin-mode-full", value: "FullSensor", text:"Full Sensor"},
      {id: "bin-mode-bin", value: "BinnedSensor", text:"Full Sensor (Binned)"},
      {id: "bin-mode-row", value: "LineSensor", text:"Rows Binned"},
      // {id: "bin-mode-stupid", value: "StupidSensor", text:"Stupid Binned"}
    ]

    const inputListBinSize = [
      {id: 'lbl-row-bin-size', label: "Row Bin Size", endpoint:specEndpoint, path:"binning/bin_height", defaultValue:0},
      {id: 'col-bin-size', label: "Column Bin Size", endpoint:specEndpoint, path:"binning/bin_width", defaultValue:0},
      {id: 'line-bin-size', label: "Line Bin Count", endpoint:specEndpoint, path:"binning/row_bin_centre", defaultValue:0}
    ]

    const inputListExposure = [
      {id: 'exposure', label: "Exposure (Milliseconds)", endpoint:specEndpoint, path:"acquisition/exposure", defaultValue:1000},
      {id: "center-wave", label: "Centre Wavelength (nm)", endpoint:specEndpoint, path:"acquisition/acquisition", defaultValue:1400}
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
                {/* <ButtonGroup size='lg'> */}
                  <EndpointButton id="begin_acquisition" value={true} endpoint={acqEndpoint} fullpath="start_acquisition">Begin Acquisition</EndpointButton>
                  <Button disabled>Stop Acquisition</Button>
                {/* </ButtonGroup> */}
              </Col>
              <Col>
                <Button disabled>Begin Cooldown</Button>
              </Col>
            </Row>
            <Row className="mb-2">
              <OdinEndpointToggleButtons
              name="photoModeButtons"
              endpoint={acqEndpoint}
              path="photo_lum_mode"
              buttons={photoModeButtons}
              />
            </Row>
            <Row>
              <Col>
                <OdinEndpointToggleButtons
                name="binModeButtons"
                endpoint={specEndpoint}
                path="binning/binning_mode"
                buttons={binningModeButtons}
                />
                <hr />
                <OdinForm
                  inputs={inputListBinSize}
                />
                <OdinForm
                  inputs={inputListExposure}
                  />
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
            <Row>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    )
  }

  export default ControlCard;