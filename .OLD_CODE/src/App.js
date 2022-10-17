import OdinNav from './components/OdinNav';
import MainPage from '../odin-react/example/src/MainPage';
import CryoPage from './components/CryoPage';
import ErrorBoundary from './components/ErrorBoundary';

import AdapterEndpoint from '../odin-react/example/src/odin_control.js';

import usePeriodicFetch from './services/usePeriodicFetch';


import React, {useState} from 'react';
import SpectrometerPage from '../odin-react/example/src/SpectrometerPage';


function App() {
  
  const cryoEndpoint = new AdapterEndpoint("cryostat", process.env.REACT_APP_ENDPOINT_URL);
  const specEndpoint = new AdapterEndpoint("spectrometer", process.env.REACT_APP_ENDPOINT_URL);
  const attoEndpoint = new AdapterEndpoint("attocube", process.env.REACT_APP_ENDPOINT_URL);
  const acqEndpoint  = new AdapterEndpoint("acquisition", process.env.REACT_APP_ENDPOINT_URL);

  // const [cryoResult, changeCryo] = useState(null);
  const {response: cryoResult} = usePeriodicFetch("", cryoEndpoint);
  const {response: specResult} = usePeriodicFetch("", specEndpoint);
  const {response: attoResult} = usePeriodicFetch("", attoEndpoint);
  const {response: acqResult}  = usePeriodicFetch("", acqEndpoint);

  return (
    // <OdinContext.Provider value={{cryoEndpoint, specEndpoint, attoEndpoint, acqEndpoint}}>
    <OdinNav title="Spectrometer Integration"
            navLinks={["Main Page", "Spectrometer", "Cryostat", "Attocube"]}>
          <MainPage
            cryoResult={cryoResult}
            specResult={specResult}
            attoResult={attoResult}
            cryoEndpoint={cryoEndpoint}
            specEndpoint={specEndpoint}
            acqEndpoint={acqEndpoint}
            name="Main"
          />
        <SpectrometerPage
          specEndpoint={specEndpoint}
          acqEndpoint={acqEndpoint}
        />
        <CryoPage
          cryoEndpoint={cryoEndpoint}
          cryoResult={cryoResult}
        />
    </OdinNav>
  // </OdinContext.Provider>
  );
}

export default App;

