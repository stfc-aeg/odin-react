import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import OdinNav from './components/OdinNav';
import MainPage from './components/MainPage';
import CryoPage from './components/CryoPage';

import AdapterEndpoint from './odin_control.js';

import usePeriodicFetch from './services/usePeriodicFetch';


import React, {useState} from 'react';
import SpectrometerPage from './components/SpectrometerPage';


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

  const [tabKey, setKey] = useState("Main Page");

  return (
    <>
    <OdinNav title="Spectrometer Integration"
            defaultPage="main"
            navLinks={["Main Page", "Spectrometer", "Cryostat", "Attocube"]}
            tabKey={tabKey}
            setKey={setKey}/>
    <Tab.Container id="app-tabs" defaultActiveKey="Main Page" activeKey={tabKey}>
    <Tab.Content>
      <Tab.Pane eventKey='Main Page' title="Main Page">
        <MainPage
          cryoEndpoint={cryoAdapter}
          specEndpoint={specAdapter}
          acqEndpoint={acqAdapter}
          cryoResult={cryoResult}
          specResult={specResult}
          attoResult={attoResult}
          name="Main"
        />
      </Tab.Pane>
      <Tab.Pane eventKey='Spectrometer' title="Spectrometer">
        <SpectrometerPage
          specEndpoint={specAdapter}
          acqEndpoint={acqAdapter}
        />
      </Tab.Pane>
      <Tab.Pane eventKey='Cryostat' title="Cryostat">
        <CryoPage
          cryoEndpoint={cryoAdapter}
          cryoResult={cryoResult}
        />
      </Tab.Pane>
      <Tab.Pane eventKey='Attocube' title="Attocube" disabled></Tab.Pane>
    </Tab.Content>
    {/* </Tabs> */}
  </Tab.Container>

  </>
  );
}

export default App;

