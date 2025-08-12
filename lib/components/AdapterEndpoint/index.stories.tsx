import type { Meta, StoryObj } from '@storybook/react-vite';

import {  useAdapterEndpoint } from './index';

import type { NodeJSON } from './index';

import { FloatingLabel, InputGroup, Form, Card, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import { useCallback, useState } from 'react';

interface Endpoint {
  adapter: string;
  endpoint_url: string;
  interval?: number;
  timeout?: number;

}

const EndpointDisplay: React.FC<Endpoint> = (
  {adapter, endpoint_url, interval, timeout}
) => {
  
  const endpoint = useAdapterEndpoint(adapter, endpoint_url, interval, timeout);

  const [path, setPath] = useState("");
  const [putData, setPutData] = useState<NodeJSON>({string_val: "String Value Test"});

  const [responseData, setResponseData] = useState<NodeJSON>({});

  const triggerGet = useCallback((event: React.MouseEvent) => {
    
    console.log("GET REQUEST:", path);
    endpoint.get(path)
      .then((response) => {
        console.log(response);
        setResponseData(response);
      })
  }, [path, endpoint]);

  const triggerPut = useCallback((event: React.MouseEvent) => {
    console.log("PUT REQUEST:", path, putData);
    endpoint.put(putData, path)
      .then((response) => {
        console.log("RESPONSE", response);
        setResponseData(response);
      })
  }, [path, endpoint, putData]);

  return (
    <Card>
      <Card.Header>
        <InputGroup size='sm'>
          <FloatingLabel label="Param Path">
            <Form.Control onChange={(event) => setPath(event.target.value)} placeholder=''/>
          </FloatingLabel>
          <FloatingLabel label="PUT data">
            <Form.Control onChange={(event) => setPutData(JSON.parse(event.target.value))}
            placeholder='' value={JSON.stringify(putData)}/>
          </FloatingLabel>
        </InputGroup>
        <ButtonGroup>
          <Button value={path} onClick={triggerGet}>GET</Button>
          <Button onClick={triggerPut} variant='secondary'>PUT</Button>
        </ButtonGroup>
      </Card.Header>
      <Card.Header>
        Response Data
        <pre style={{border: "1px solid black"}}>
          <code>
            {JSON.stringify(responseData, undefined, 2)}
          </code>
        </pre>
      </Card.Header>
      <Card.Body>
        <Row><Col>
      Endpoint.data
      <pre style={{border: "1px solid black"}}>
        <code>
          {JSON.stringify(endpoint.data, undefined, 2)}
        </code>
      </pre>
      </Col>
      <Col>
      Endpoint Metadata
      <pre style={{border: "1px solid black"}}>
        <code>
          {JSON.stringify(endpoint.metadata, undefined, 2)}
        </code>
      </pre>
      </Col></Row>
    
    </Card.Body>
    </Card>
  )
}


const meta = {
  component: EndpointDisplay,
} satisfies Meta<typeof useAdapterEndpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    adapter: "Test",
    endpoint_url: "http://localhost:1337"
  }
};