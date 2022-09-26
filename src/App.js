import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import OdinNav from './components/OdinNav';
import MainPage from './components/MainPage';
import CryoPage from './components/CryoPage';

import AdapterEndpoint from './odin_control.js';

import usePeriodicFetch from './services/usePeriodicFetch';


import React, { useEffect, useState } from 'react';


function App() {
  
  const cryoAdapter = new AdapterEndpoint("cryostat", process.env.REACT_APP_ENDPOINT_URL);
  const specAdapter = new AdapterEndpoint("spectrometer", process.env.REACT_APP_ENDPOINT_URL);
  const attoAdapter = new AdapterEndpoint("attocube", process.env.REACT_APP_ENDPOINT_URL);
  const acqAdapter  = new AdapterEndpoint("acquisition", process.env.REACT_APP_ENDPOINT_URL);

  // const [cryoResult, changeCryo] = useState(null);
  const {response: cryoResult} = usePeriodicFetch("", cryoAdapter);
  const {response: specResult} = usePeriodicFetch("", specAdapter);
  const {response: attoResult} = usePeriodicFetch("", attoAdapter);
  const {response: acqResult}  = usePeriodicFetch("", acqAdapter);
  // const [specResult, changeSpec] = useState(null);
  // const [attoResult, changeAtto] = useState(null);
  // const [acqResult, changeAcq] = useState(null);

  return (
  <>
  <OdinNav title="Spectrometer Integration"
           defaultPage="main"
           navLinks={["main", "spectrometer", "cryo", "attocube"]}/>
  <Tabs defaultActiveKey='main' id="main-tabs">
    <Tab eventKey='main' title="Main Page">
      <MainPage
        cryoEndpoint={cryoAdapter}
        specEndpoint={specAdapter}
        acqEndpoint={acqAdapter}
        cryoResult={cryoResult}
        name="Main"
      />
    </Tab>
    <Tab eventKey='spectrometer' title="Spectrometer" disabled></Tab>
    <Tab eventKey='cryo' title="Cryostat">
      <CryoPage
        cryoEndpoint={cryoAdapter}
        cryoResult={cryoResult}
      />
    </Tab>
    <Tab eventKey='attocube' title="Attocube" disabled></Tab>
    
    </Tabs>

    {/* <p>cryoAdapter.get("")</p> */}
  </>
  );
}

export default App;

