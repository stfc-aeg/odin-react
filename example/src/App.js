import React, { useEffect, useState } from 'react'

import { OdinApp, ToggleSwitch, usePeriodicFetch } from 'odin-react';

// import MainPage from './MainPage';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';
// import AdapterEndpoint from './odin_control';
// import SpectrometerPage from './SpectrometerPage';
// import CryoPage from './CryoPage';
import { TitleCard, StatusBox, ParameterTable,ParameterEntry, DropdownSelector, LiveViewImage } from 'odin-react';
import { WithEndpoint, useAdapterEndpoint } from 'odin-react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { GraphCard } from 'odin-react';

import { Canvas } from 'odin-react';
import {ScopeCanvas} from 'odin-react';

// import { ParameterTable } from 'odin-react';
// import { StatusBox } from '../../src';

const EndpointDropdown = WithEndpoint(DropdownSelector);
const EndpointButton = WithEndpoint(Button);

const EndpointToggleButton = WithEndpoint(ToggleSwitch)

const App = () => {

  // const exampleEndpoint = useAdapterEndpoint("react", process.env.REACT_APP_ENDPOINT_URL, {interval: 500});

  const graphEndpoint = useAdapterEndpoint("scope", process.env.REACT_APP_ENDPOINT_URL, {interval: 1});
  const rand_num = graphEndpoint.data ? graphEndpoint.data.data.x[graphEndpoint.data.length -1] : 0;
  const select_list = [];
  const selected = null;

  // const data_1 = {label: "Random Numbers",
  //                 x: graphEndpoint.data ? graphEndpoint.data.dummy_1.timestamps : [0],
  //                 y: graphEndpoint.data ? graphEndpoint.data.dummy_1.data : [0]};
  // const data_2 = {label: "Averages",
  //                 x: graphEndpoint.data ? graphEndpoint.data.dummy_30.timestamps: [0],
  //                 y: graphEndpoint.data ? graphEndpoint.data.dummy_30.data : [0]};

  const data_1 = {label: "Sine Graph",
                  x : graphEndpoint.data ? graphEndpoint.data.data.x: [0],
                  y: graphEndpoint.data ? graphEndpoint.data.data.y: [0]}
  const testData1 = {x: [0, 1, 2, 3, 4], y: [5, 10, 15, 20, 21]};
  const testData2 = {x: [0, 2, 4], y: [22, 24, 26]};
  const testData3 = {x: [4, 5, 6], y: [40, 50, 60]};
  const data = [data_1];
  // const [data, changeData] = useState([testData1]);

  const smooth_random_number = (prev_value, min, max, max_step) => {
    let value = prev_value - max_step + Math.floor(Math.random() * max_step*2);
    // console.log(value)
    if(value < min){ value = min}
    if(value > max){ value = max}

    return value;
  }

  const max_data = 1000;

  // useEffect(() => {

  //   const updateData = (data) => {
  //     let temp_data = data[0];
  //     let current_y = temp_data.y[temp_data.y.length - 1];
  //     temp_data.y.push(smooth_random_number(current_y, 0, 20, 10));
  //     if(temp_data.y.length > max_data){
  //       temp_data.y.shift();
  //     }
  //     let current_x = temp_data.x[temp_data.x.length - 1];
  //     temp_data.x.push(current_x + 1);
  //     if(temp_data.x.length > max_data){
  //       temp_data.x.shift();
  //     }
  //     return [temp_data]
  //   }

    
  //   const interval = setInterval(() => {
  //     // console.log(data);
  //     // updateData(data)
  //     changeData(updateData(data))
  //   }, 1);

    // return () => clearInterval(interval);
  // }, [data]);
// 
  // const graphX = graphEndpoint.data ? graphEndpoint.data.dummy_1.timestamps : [];
  // const graphY = graphEndpoint.data ? graphEndpoint.data.dummy_1.data : [];
  return (
  <OdinApp title="Spectrometer Integration"
  navLinks={["Page 1", "Page 2", "Page 3", "Attocube"]}>
    <Container>
      <Row>
      <Col>
      <TitleCard title="Odin React Example">
        <StatusBox label="Test" text={0}/>
      </TitleCard>
      </Col>
      </Row>
      <Row>
      <Col>
      {/* <GraphCard title="Graph Test" data={data} isTimestamps={true}/> */}
      <TitleCard title="Scope Canvas">
        <ScopeCanvas data={data} backColor="Azure" axisColor="Black" drawPoints={true} isTimeBased={false}
                     yLowerBound={-2} yUpperBound={2}></ScopeCanvas>
      </TitleCard>
    </Col>
    </Row>
    </Container>
    <Container>
      <Row>
        <Col>
        <TitleCard title="Live Image Example">
          {/* <LiveViewImage adapter="react" imgpath="image" defaultSrc="odin.png"/> */}
          {/* <Canvas draw={draw}></Canvas> */}
          
        </TitleCard>
        </Col>
      </Row>
    </Container>
    <Container>
      <Row>
        <Col>
        <TitleCard title="Dropdown Example">
          {/* <EndpointDropdown buttonText="Test Dropdown" id="testDrop"
            endpoint={exampleEndpoint} type="select" fullpath="selected"  >
            {select_list.map(
              (selection) => (
                <Dropdown.Item eventKey={selection} key={selection} active={selected=== selection}>{selection}</Dropdown.Item>
              ))}
          </EndpointDropdown> */}
        </TitleCard>
        </Col>
      </Row>
    </Container>

  </OdinApp> 
  )
}

export default App
