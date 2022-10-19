import React from 'react'

import { OdinApp, usePeriodicFetch } from 'odin-react';

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

const App = () => {

  const cryoEndpoint = useAdapterEndpoint("cryostat", process.env.REACT_APP_ENDPOINT_URL, {interval: 500});
  // const specEndpoint = new AdapterEndpoint("spectrometer", process.env.REACT_APP_ENDPOINT_URL);
  // const attoEndpoint = new AdapterEndpoint("attocube", process.env.REACT_APP_ENDPOINT_URL);
  // const acqEndpoint  = new AdapterEndpoint("acquisition", process.env.REACT_APP_ENDPOINT_URL);

  // const {response: cryoResult} = usePeriodicFetch("", cryoEndpoint);
  // const {response: specResult} = usePeriodicFetch("", specEndpoint);
  // const {response: attoResult} = usePeriodicFetch("", attoEndpoint);
  // // const {response: acqResult}  = usePeriodicFetch("", acqEndpoint);

  const atsmTemp = cryoEndpoint.data ? `${cryoEndpoint.data.atsm.temperature.toFixed(5)}k` : "0k";
  
  const powerSchedule = cryoEndpoint.data ? cryoEndpoint.data.atsm.power_schedule : {0: 0, 1: 0};
  const powerScheduleSelected = cryoEndpoint.data ? cryoEndpoint.data.atsm.power_schedule_selected : null;
  const scheduleList = cryoEndpoint.data ? cryoEndpoint.data.atsm.power_schedules_avail : ["None", "None2"];

  

  return (
  <OdinApp title="Spectrometer Integration"
  navLinks={["Main Page", "Spectrometer", "Cryostat", "Attocube"]}>
    <Container>
      <Row>
      <Col>
      <TitleCard title="Odin React Example">
        <StatusBox label="Test" text={atsmTemp}/>
      </TitleCard>
    </Col>
    <Col>
      <TitleCard title="Table Example">
        <EndpointDropdown buttonText="Test Dropdown" id="testDrop"
          endpoint={cryoEndpoint} type="select" fullpath="atsm/power_schedule_selected">
          {scheduleList.map(
            (schedule) => (
              <Dropdown.Item eventKey={schedule} active={powerScheduleSelected == schedule}>{schedule}</Dropdown.Item>
            ))}
        </EndpointDropdown>
        <ParameterTable unit={false} paramTitle="Temperature">
          {Object.keys(powerSchedule).map((param, index) => (
            <ParameterEntry key={index} name={param} value={powerSchedule[param]} unit="None"/>
          ))}
        </ParameterTable>
      </TitleCard>
    </Col>
    </Row>
    </Container>
    <Container>
      <Row>
        <Col>
        <TitleCard title="Dropdown Example">
        
        </TitleCard>
        </Col>
      </Row>
    </Container>
  </OdinApp> 
  )
}

export default App
