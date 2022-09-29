import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Card from 'react-bootstrap/Card';
import OdinCard from './OdinCard';

import StatusCard from './StatusCard'
import ControlCard from './ControlCard'
import LiveImage from './LiveImage';
import StatusBox from './StatusBox';

import React, { useEffect, useState } from 'react';

// const statuses_list = [
//     {id: "spec_status", variant: 'success', text: "Spectrometer Ready"},
//     {id: "cryo_status", variant: 'success', text: `Cryo Status: ${cryo_temp}`},
//     {id: "atto_status", variant: 'danger', text: "Attocube Disconnected"}
//   ]
  
// const status_labels = [
//     statuses_list,
//     [{id:"acq_run", variant:'success', text:"Acquisition NOT Running: temp.hdf5"}]
//   ]



function MainPage(props) {
    const cryoResult = props.cryoResult;
    const specResult = props.specResult;
    const attoResult = props.attoResult;
    
    const atsmTemp = cryoResult ? `${cryoResult.atsm.temperature.toFixed(5)}k` : "0k";
    const cryoGoal = cryoResult ? cryoResult.system_goal.split(":")[0].trim() : "Unknown";
    // const cryoColor = (cryoGoal == "None") ? "success" : (cryoGoal == "Unknown") ? "danger" : "warning";

    const attoState = attoResult ? (attoResult.device_connected ? "Connected" : "Disconnected") : "Unknown";
    // const attoColour = (attoState == "Connected") ? 'success' : 'danger';

    const [cryoColour, changeCryoColour] = useState('primary');
    const [attoColour, changeAttoColor] = useState('primary');

    useEffect(() => 
    {
      console.log("cryo colour effect called");
      switch(cryoGoal.toLowerCase()){
        case "none": changeCryoColour("success"); break;
        case "unknown": changeCryoColour("danger"); break;
        default: changeCryoColour("warning");
      }
    }, [cryoGoal]);

    useEffect(() =>
    {
      console.log("Atto State Colour Effect Called");
      switch(attoState.toLowerCase()){
        case "connected": changeAttoColor("success"); break;
        default: changeAttoColor("danger");
      }
    }, [attoState]);
    
    return (
    <Container fluid className="mt-4">
    <Row>
      <Col md="5">
        <OdinCard title="System Status">
          <Row>
            <Col>
              <StatusBox text="Spectrometer Ready"/>
            </Col>
            <Col>
              <StatusBox type={cryoColour} label="Cryostat" text={cryoGoal}/>
            </Col>
            <Col>
              <StatusBox type={attoColour} label="AttoCube" text={attoState}/>
            </Col>
          </Row>
          <ProgressBar now={40}/>
        </OdinCard>
        <OdinCard title="Cryostat Temperature">
          <StatusBox label="ATSM Temperature" text={atsmTemp}/>
        </OdinCard>
      </Col>
      <Col>
        <ControlCard
          title="Basic Controls"
          specEndpoint={props.specEndpoint}
          acqEndpoint={props.acqEndpoint}
        />
      </Col>
    </Row>
    <Row>
      <Col>
      {/* <LiveImage title="Spectrometer Image" path="image" adapter={props.specEndpoint}/> */}
      </Col>
    </Row>
  </Container>
    )
}


export default MainPage;