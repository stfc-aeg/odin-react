import React from 'react'

import { OdinApp } from 'odin-react';

// import MainPage from './MainPage';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';
// import AdapterEndpoint from './odin_control';
// import SpectrometerPage from './SpectrometerPage';
// import CryoPage from './CryoPage';
// import { TitleCard, StatusBox, ParameterTable,ParameterEntry, DropdownSelector, LiveViewImage } from 'odin-react';
// import { WithEndpoint, useAdapterEndpoint } from 'odin-react';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
// import Dropdown from 'react-bootstrap/Dropdown';
// import Button from 'react-bootstrap/Button';
// import { GraphCard } from 'odin-react';

// import { Canvas } from 'odin-react';
// import {ScopeCanvas} from 'odin-react';

import EndpointExamplePage from './EndpointExample';
import WorkshopExamplePage from './WorkshopExample';
import GraphExamplePage from './GraphExample';

const App = () => {

  return (
  <OdinApp title="Odin React Example"
  navLinks={["Workshop", "With Endpoint Examples", "Graph Examples"]}>
    <WorkshopExamplePage />
    <EndpointExamplePage />
    <GraphExamplePage/>

  </OdinApp> 
  )
}

export default App
