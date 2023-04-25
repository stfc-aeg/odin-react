import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ProgressBar from 'react-bootstrap/ProgressBar'
import Card from 'react-bootstrap/Card';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

import {TitleCard} from 'odin-react';
import StatusCard from './StatusCard'
import ControlCard from './ControlCard'
// import LiveImage from '../../../src/components/LiveImage';
import {StatusBox} from 'odin-react';
// import { useOdinContext } from '../services/odinContext';

import {WithEndpoint} from 'odin-react';

import React, { useEffect, useState, useContext } from 'react';

const TestButton = WithEndpoint(ToggleButton);
const TestToggleGroup = WithEndpoint(ToggleButtonGroup);

function MainPage(props) {
  // const {cryoEndpoint, specEndpoint, acqEndpoint} = useOdinContext();
  const {cryoResult, specResult, attoResult} = props;
  const {cryoEndpoint, specEndpoint, acqEndpoint} = props;
    // const cryoResult = props.cryoResult;
    // const specResult = props.specResult;
    // const attoResult = props.attoResult;
    
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
        <TitleCard title="System Status">
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
        </TitleCard>
        <TitleCard title="Cryostat Temperature">
          <StatusBox label="ATSM Temperature" text={atsmTemp}/>
        </TitleCard>
      </Col>
      <Col>
        {/* <ControlCard
          title="Basic Controls"
          specEndpoint={specEndpoint}
          acqEndpoint={acqEndpoint}
        /> */}
      </Col>
    </Row>
    <Row>
      <Col>
      <TestButton id="testButton" value={false} endpoint={cryoEndpoint} fullpath="bakeout/enabled">Test</TestButton>
      </Col>
      <Col>
      {/* <TestToggleGroup id="testGroup" type='radio' defaultValue={0} fullPath="">

        </TestToggleGroup> */}
      </Col>
    </Row>
  </Container>
    )
}


export default MainPage;