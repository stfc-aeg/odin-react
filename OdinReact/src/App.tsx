import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { OdinApp } from '../'

import { MainPage } from './MainPage';
import { EndpointPage } from './EndpointPage';

function App() {

  return (
    <OdinApp title='Test' navLinks={["Workshop", "Endpoint Testing"]}>
      <MainPage/>
      <EndpointPage />
    </OdinApp>
  )
}

export default App
