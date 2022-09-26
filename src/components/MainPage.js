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
    const atsmTemp = cryoResult ? cryoResult.atsm.temperature : 0;
    const cryoGoal = cryoResult ? cryoResult.system_goal.split(":")[0].trim() : "Unknown";
    
    
    // const [cryo_temp, temp_change] = useState(0);
    const [cryo_label_colour, changeCryoColor] = useState('success');
    const [cryo_status, changeCryoStatus] = useState('None');
    const cryoStatus = [[{id: "cryo-temp-main",
                          variant:"secondary",
                          text:`ATSM Temperature: ${atsmTemp.toFixed(5)}k`}]];

    const statuses_list = [
        {id: "spec_status", variant: 'success', text: "Spectrometer Ready"},
        {id: "cryo_status", variant: cryo_label_colour, text: `Cryo Status: ${cryoGoal}`},
        {id: "atto_status", variant: 'danger', text: "Attocube Disconnected"}
      ]
      
    const status_labels = [
        statuses_list,
        [{id:"acq_run", variant:'success', text:"Acquisition NOT Running: temp.hdf5"}]
      ]

    function updateCryoStatus(system_goal_string)
      {
        var goal = system_goal_string.split(":")[0].trim();
        var state = system_goal_string.split(":")[1].trim();
      
        switch(goal){
          case "None":
            changeCryoStatus("None");
            changeCryoColor("success");
            break;
          case "PullVacuum":
            changeCryoStatus("Pull Vacuum");
            changeCryoColor("warning");
            break;
         case "Vent":
            changeCryoStatus("Venting");
            changeCryoColor("warning");
            break;
          case "Cooldown":
            changeCryoStatus("Cooldown");
            changeCryoColor("warning");
            break;
          case "Warmup":
            changeCryoStatus("Warmup");
            changeCryoColor("warning");
            break;
          case "UNKNOWN":
          default:
            changeCryoStatus("Unknown");
            changeCryoColor("danger");
            break;
        }
      }

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