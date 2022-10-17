import React from 'react'

import { OdinNav, OdinCard, StatusBox, usePeriodicFetch} from 'odin-react';

import MainPage from './MainPage';
import 'odin-react/dist/index.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import AdapterEndpoint from './odin_control';
import SpectrometerPage from './SpectrometerPage';
import CryoPage from './CryoPage';

const App = () => {

  const cryoEndpoint = new AdapterEndpoint("cryostat", process.env.REACT_APP_ENDPOINT_URL);
  const specEndpoint = new AdapterEndpoint("spectrometer", process.env.REACT_APP_ENDPOINT_URL);
  const attoEndpoint = new AdapterEndpoint("attocube", process.env.REACT_APP_ENDPOINT_URL);
  const acqEndpoint  = new AdapterEndpoint("acquisition", process.env.REACT_APP_ENDPOINT_URL);

  const {response: cryoResult} = usePeriodicFetch("", cryoEndpoint);
  const {response: specResult} = usePeriodicFetch("", specEndpoint);
  const {response: attoResult} = usePeriodicFetch("", attoEndpoint);
  const {response: acqResult}  = usePeriodicFetch("", acqEndpoint);

  return (
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
  )
}

export default App
