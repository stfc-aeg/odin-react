import { useState } from 'react'

// import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { useAdapterEndpoint } from '../'
import { Label, Input, TitleCard } from '../';
import { WithEndpoint, OdinApp } from '../'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Container, InputGroup, Stack, Row, Col } from 'react-bootstrap';
import { MainPage } from './MainPage';
import { EndpointPage } from './EndpointPage';

const EndpointButton = WithEndpoint(Button as any);
const EndpointInput = WithEndpoint(Form.Control as any);

function App() {
  const endpoint = useAdapterEndpoint("react", import.meta.env.VITE_ENDPOINT_URL);

  const [count, setCount] = useState(0)
  const [inputCustomCountValue, setInputCustomCountValue] = useState('');

  const handleClickCustomCount = () => {
    if (inputCustomCountValue === '') {
      setCount(count => count + 1);
    } else {
      setCount(Number(inputCustomCountValue));
    }
  }

  return (
    <OdinApp title='Test' navLinks={["Workshop", "Endpoint Testing"]}>
      <MainPage/>
      <EndpointPage />
    </OdinApp>
  )
}

export default App
