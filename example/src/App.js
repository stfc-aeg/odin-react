import React from 'react'

import { OdinApp, ToggleSwitch, usePeriodicFetch } from 'odin-react';

// import MainPage from './MainPage';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';
// import AdapterEndpoint from './odin_control';
// import SpectrometerPage from './SpectrometerPage';
// import CryoPage from './CryoPage';
import { TitleCard, StatusBox, ParameterTable,ParameterEntry, DropdownSelector } from 'odin-react';
import { WithEndpoint, useAdapterEndpoint } from 'odin-react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
// import { ParameterTable } from 'odin-react';
// import { StatusBox } from '../../src';

const EndpointDropdown = WithEndpoint(DropdownSelector);
const EndpointButton = WithEndpoint(Button);

const EndpointToggleButton = WithEndpoint(ToggleSwitch)

const App = () => {

  const exampleEndpoint = useAdapterEndpoint("react", process.env.REACT_APP_ENDPOINT_URL, {interval: 500});

  const rand_num = exampleEndpoint.data ? exampleEndpoint.data.rand_num : 0;
  const select_list = exampleEndpoint.data ? exampleEndpoint.data.select_list : [];
  const selected = exampleEndpoint.data ? exampleEndpoint.data.selected : null;

  return (
  <OdinApp title="Spectrometer Integration"
  navLinks={["Main Page", "Spectrometer", "Cryostat", "Attocube"]}>
    <Container>
      <Row>
      <Col>
      <TitleCard title="Odin React Example">
        <StatusBox label="Test" text={rand_num}/>
      </TitleCard>
    </Col>
    <Col>
      <TitleCard title="Button Example">

        <EndpointButton endpoint={exampleEndpoint} type="click" fullpath="trigger" id="testButton"
          value="Test Button">
            Test Trigger
        </EndpointButton>
        <EndpointToggleButton endpoint={exampleEndpoint} fullpath="toggle" id="testToggle" label="Test Toggle"/>
      </TitleCard>
    </Col>
    </Row>
    </Container>
    <Container>
      <Row>
        <Col>
        <TitleCard title="Dropdown Example">
          <EndpointDropdown buttonText="Test Dropdown" id="testDrop"
            endpoint={exampleEndpoint} type="select" fullpath="selected"  >
            {select_list.map(
              (selection) => (
                <Dropdown.Item eventKey={selection} key={selection} active={selected=== selection}>{selection}</Dropdown.Item>
              ))}
          </EndpointDropdown>
        </TitleCard>
        </Col>
      </Row>
    </Container>
  </OdinApp> 
  )
}

export default App
