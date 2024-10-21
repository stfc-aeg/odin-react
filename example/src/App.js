import React from 'react'

import { OdinApp } from 'odin-react';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';

import EndpointExamplePage from './EndpointExample';
import WorkshopExamplePage from './WorkshopExample';
import GraphExamplePage from './GraphExample';



const App = () => {


  const postPutMethod = () => {
    console.log("Post Message Method Called");
  }

  return (
  <OdinApp title="Odin React Example"
  navLinks={["Workshop", "With Endpoint Examples", "Graph Examples"]}
  icon_src="odin.png"
  icon_hover_src="prodin.png">
    <WorkshopExamplePage />
    <EndpointExamplePage postPutMethod={postPutMethod}/>
    <GraphExamplePage/>

  </OdinApp> 
  )
}

export default App
