import { useState } from 'react'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// import { Button } from '../'
import { useAdapterEndpoint } from '../'
import { Label, Input, TitleCard } from '../';
import { WithEndpoint } from '../'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { InputGroup, Stack } from 'react-bootstrap';

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
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <Label>My Label</Label><br />
        <Input
          placeholder="Custom count"
          value={inputCustomCountValue}
          onChange={(e) => setInputCustomCountValue(e.target.value)}
        /><br />
        <Button onClick={handleClickCustomCount}>
          count is {count}
        </Button>
        <br/>
        <TitleCard title="Endpoint Tests">
          <Stack>
          <EndpointButton endpoint={endpoint} event_type="click" fullpath='trigger' value={42}>
            Trigger
          </EndpointButton>
          <InputGroup>
            <InputGroup.Text>Enter Text:</InputGroup.Text>
            <EndpointInput endpoint={endpoint} fullpath='string_val' value_type='string'/>
          </InputGroup>
          </Stack>
        </TitleCard>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
