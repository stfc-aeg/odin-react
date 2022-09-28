import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ProgressBar from 'react-bootstrap/ProgressBar'

import StatusCard from './StatusCard'
import ControlCard from './ControlCard'

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
    
    const atsmTemp = cryoResult ? cryoResult.atsm.temperature : 0;
    const cryoGoal = cryoResult ? cryoResult.system_goal.split(":")[0].trim() : "Unknown";
    // const cryoColor = (cryoGoal == "None") ? "success" : (cryoGoal == "Unknown") ? "danger" : "warning";

    const attoState = attoResult ? (attoResult.device_connected ? "Connected" : "Disconnected") : "Unknown";
    // const attoColour = (attoState == "Connected") ? 'success' : 'danger';

    const [cryoColour, changeCryoColour] = useState('primary');
    const [attoColour, changeAttoColor] = useState('primary');

    const cryoStatus = [[{id: "cryo-temp-main",
                          variant:"secondary",
                          text:`ATSM Temperature: ${atsmTemp.toFixed(5)}k`}]];

    const statuses_list = [
        {id: "spec_status", variant: 'success', text: "Spectrometer Ready"},
        {id: "cryo_status", variant: cryoColour, text: `Cryo Status: ${cryoGoal}`},
        {id: "atto_status", variant: attoColour, text: `Attocube: ${attoState}`}
      ]
      
    const status_labels = [
        statuses_list,
        [{id:"acq_run", variant:'success', text:"Acquisition NOT Running: temp.hdf5"}]
      ]

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
        <StatusCard id="main-status"
          statuses={status_labels}
          title="System Status"
        //   children={<AddProgressBar/>}
          >
            <Col>
                <ProgressBar now={40} />
            </Col>
        </StatusCard>
        <StatusCard id="cryo-temp-main"
            title="Cryostat Temperature"
            statuses={cryoStatus}
        />
      </Col>
      <Col>
        <ControlCard
          title="Basic Controls"
          specEndpoint={props.specEndpoint}
          acqEndpoint={props.acqEndpoint}
        />
      </Col>
    </Row>
  </Container>
    )
}


export default MainPage;