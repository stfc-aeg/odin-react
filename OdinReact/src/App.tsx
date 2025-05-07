import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { OdinApp } from '../'

import { MainPage } from './MainPage';
import { EndpointPage } from './EndpointPage';
import { GraphPage } from './GraphPage';

function App() {

  return (
    <OdinApp title='Test' navLinks={["Workshop", "Endpoint Testing", "Graph Testing"]}>
      <MainPage/>
      <EndpointPage />
      <GraphPage />
    </OdinApp>
  )
}

export default App
