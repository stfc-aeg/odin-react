import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { OdinApp, useAdapterEndpoint } from '../'

import { MainPage } from './MainPage';
import { EndpointPage, EndpointData_t } from './EndpointPage';
import { GraphPage } from './GraphPage';
import { LogMessagePage } from './LogMessagePage';
import { PeriodicEndpointPage } from './PeriodicEndpointPage';
import {LiveViewPage} from './LiveViewPage';

function App() {

  const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL);
  return (
    <OdinApp title='Test' navLinks={["Workshop", {"Endpoints" : ["Normal", "Periodic"]}, "Graph Testing", "Log Display", "Live View"]}>
      <MainPage/>
      <EndpointPage endpoint={endpoint}/>
      <PeriodicEndpointPage/>
      <GraphPage />
      <LogMessagePage/>
      <LiveViewPage/>
    </OdinApp>
  )
}

export default App
