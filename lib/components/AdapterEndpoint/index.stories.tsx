import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAdapterEndpoint } from './index';

import { ComponentProps, useMemo, useState } from 'react';
import type { ParamNode } from './index';

import { FloatingLabel, InputGroup, Form, Card, ButtonGroup, Button, ToggleButton, Row, Col } from 'react-bootstrap';

interface Endpoint {
  adapter: string;
  endpoint_url: string;
  interval?: number;
  timeout?: number;

}

const EndpointDispaly: React.FC<Endpoint> = (
  { adapter, endpoint_url, interval, timeout }
) => {
  const endpoint = useAdapterEndpoint(adapter, endpoint_url, interval, timeout);

  const [path, setPath] = useState("");
  const [putData, setPutData] = useState<ParamNode>({ string_val: "String Value Test" });
  const [responseData, setResponseData] = useState<ParamNode>({});
  const [wantsMetadata, setWantsMetadata] = useState(false);

  const triggerGet: ComponentProps<typeof Button>["onClick"] = (event) => {
    endpoint.get(path, {wants_metadata: wantsMetadata})
      .then((response) => {
        console.log(response);
        setResponseData(response);
      })
      .catch((error) => {
        setResponseData({"error": (error as Error).message});
      });
      
  }

  const triggerPut: ComponentProps<typeof Button>["onClick"] = (event) => {
    endpoint.put(putData, path)
      .then((response) => {
        console.log("RESPONSE", response);
        setResponseData(response);
      }).catch((error) => {
        setResponseData({"error": (error as Error).message});
      });
  }

  const displayFullTree = useMemo(() => {return endpoint.data}, [endpoint.updateFlag]);

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
        <Form>
          <Form.Check type='switch' id="metadata-switch" label="get Metadata"
            checked={wantsMetadata} onChange={(e) => setWantsMetadata(e.target.checked)}/>
        </Form>
        {/* <ToggleButton checked={wantsMetadata} value="metadata" id='metadata'
            onChange={(e) => setWantsMetadata(e.target.checked)}
            variant='outline-primary'>
              Get Metadata
        </ToggleButton> */}
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
          {JSON.stringify(displayFullTree, undefined, 2)}
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
  component: EndpointDispaly,
} satisfies Meta<typeof useAdapterEndpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    adapter: "test",
    endpoint_url: "http://localhost:1337"
  }
};

export const UpdateOdin: Story = {
  args: {
    adapter: "test",
    endpoint_url: "http://localhost:1338"
  }
}