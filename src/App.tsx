import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { OdinApp, useAdapterEndpoint } from '../'

import { MainPage } from './MainPage';
import { EndpointPage, EndpointData_t } from './EndpointPage';
import { GraphPage } from './GraphPage';
import { LogMessagePage } from './LogMessagePage';
import { PeriodicEndpointPage } from './PeriodicEndpointPage';

function App() {

  const endpoint = useAdapterEndpoint<EndpointData_t>("react", import.meta.env.VITE_ENDPOINT_URL);
  return (
    <OdinApp title='Test' navLinks={["Workshop", "Endpoint Testing", "Periodic Endpoint Testing", "Graph Testing", "Log Display"]}>
      <MainPage/>
      <EndpointPage endpoint={endpoint}/>
      <PeriodicEndpointPage/>
      <GraphPage />
      <LogMessagePage/>
    </OdinApp>
  )
}

export default App
