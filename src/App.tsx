import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { OdinApp } from '../'

import { MainPage } from './MainPage';
import { EndpointPage } from './EndpointPage';
import { GraphPage } from './GraphPage';
import { LogMessagePage } from './LogMessagePage';

function App() {

  return (
    <OdinApp title='Test' navLinks={["Workshop", "Endpoint Testing", "Graph Testing", "Log Display"]}>
      <MainPage/>
      <EndpointPage />
      <GraphPage />
      <LogMessagePage/>
    </OdinApp>
  )
}

export default App
