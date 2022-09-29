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

  return (
    <>
    <OdinNav title="Spectrometer Integration"
            navLinks={["Main Page", "Spectrometer", "Cryostat", "Attocube"]}>
        <MainPage
          cryoEndpoint={cryoAdapter}
          specEndpoint={specAdapter}
          acqEndpoint={acqAdapter}
          cryoResult={cryoResult}
          specResult={specResult}
          attoResult={attoResult}
          name="Main"
        />
        <SpectrometerPage
          specEndpoint={specAdapter}
          acqEndpoint={acqAdapter}
        />
        <CryoPage
          cryoEndpoint={cryoAdapter}
          cryoResult={cryoResult}
        />
    </OdinNav>
  </>
  );
}

export default App;

