import React from 'react'

import { OdinApp } from 'odin-react';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';

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
