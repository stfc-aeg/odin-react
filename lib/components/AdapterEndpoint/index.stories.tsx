import type { Meta, StoryObj } from '@storybook/react-vite';

import { useAdapterEndpoint } from './index';

import { ComponentProps, useMemo, useState } from 'react';
import type { AdapterEndpoint, ParamNode } from './index';

import { adapters, update_adapters } from '../../../.storybook/stories.mock';

import { FloatingLabel, InputGroup, Form, Card, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import { expect } from 'storybook/test';

interface Endpoint {
  adapter: string;
  endpoint_url: string;
  interval?: number;
  timeout?: number;
  endpoint: AdapterEndpoint;

}

const EndpointDisplay: React.FC<Endpoint> = (
  { endpoint }
) => {
  // const endpoint = useAdapterEndpoint(adapter, endpoint_url, interval, timeout);

  const [path, setPath] = useState("");
  const [putData, setPutData] = useState<ParamNode>({});
  const [responseData, setResponseData] = useState<ParamNode>({});
  const [wantsMetadata, setWantsMetadata] = useState(false);

  const triggerGet: ComponentProps<typeof Button>["onClick"] = () => {
    endpoint.get(path, { wants_metadata: wantsMetadata })
      .then((response) => {
        console.log(response);
        setResponseData(response);
      })
      .catch((error) => {
        setResponseData({ "error": (error as Error).message });
      });

  }

  const triggerPut: ComponentProps<typeof Button>["onClick"] = () => {
    endpoint.put(putData, path)
      .then((response) => {
        console.log("RESPONSE", response);
        setResponseData(response);
      }).catch((error) => {
        setResponseData({ "error": (error as Error).message });
      });
  }

  const displayFullTree = useMemo(() => { return endpoint.data }, [endpoint.updateFlag]);

  return (
    <Card>
      <Card.Header>
        <InputGroup size='sm'>
          <FloatingLabel label="Param Path" controlId='getData'>
            <Form.Control onChange={(event) => setPath(event.target.value)} placeholder='' />
          </FloatingLabel>
          <FloatingLabel label="PUT data" controlId='putData'>
            <Form.Control onBlur={(event) => setPutData(JSON.parse(event.target.value))}
              placeholder=''/>
          </FloatingLabel>
        </InputGroup>
        <ButtonGroup>
          <Button value={path} onClick={triggerGet}>GET</Button>
          <Button onClick={triggerPut} variant='secondary'>PUT</Button>
        </ButtonGroup>
        <Form>
          <Form.Check type='switch' id="metadata-switch" label="get Metadata"
            checked={wantsMetadata} onChange={(e) => setWantsMetadata(e.target.checked)} />
        </Form>
        {/* <ToggleButton checked={wantsMetadata} value="metadata" id='metadata'
            onChange={(e) => setWantsMetadata(e.target.checked)}
            variant='outline-primary'>
              Get Metadata
        </ToggleButton> */}
      </Card.Header>
      <Card.Header>
        Response Data
        <pre style={{ border: "1px solid black" }}>
          <code>
            {JSON.stringify(responseData, undefined, 2)}
          </code>
        </pre>
      </Card.Header>
      <Card.Body>
        <Row><Col>
          Endpoint.data
          <pre style={{ border: "1px solid black" }}>
            <code>
              {JSON.stringify(displayFullTree, undefined, 2)}
            </code>
          </pre>
        </Col>
          <Col>
            Endpoint Metadata
            <pre style={{ border: "1px solid black" }}>
              <code>
                {JSON.stringify(endpoint.metadata, undefined, 2)}
              </code>
            </pre>
          </Col></Row>

      </Card.Body>
    </Card>
  )
}

/**
 * Custom hook that returns functions and access to data from an
 * Odin Control Adapter. Provides access to a local copy of the data and 
 * metadata from the specified adapter.
 * 
 * Can be set to periodically refresh the local copy with a polling loop.
 */
const meta = {
  component: EndpointDisplay,
  args: {
    adapter: "test",
    endpoint: undefined,
    interval: undefined,
    timeout: undefined
  },
  argTypes: {
    endpoint: {
      table: {
        disable: true
      }
    },
    interval: {
      type: "number",
      table: {
        
      }
    },
    timeout: {
      type: "number"
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint(args.adapter, args.endpoint_url, args.interval, args.timeout);
    return <EndpointDisplay {...args} />
  },
  beforeEach: async () => {
    for (const [_, adapter] of Object.entries(adapters)) {
      adapter.reset()
    }
    for (const [_, adapter] of Object.entries(update_adapters)) {
      adapter.reset()
    }
  }
} satisfies Meta<typeof EndpointDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    adapter: "test",
    endpoint_url: "http://localhost:1337"
  },
  play: async ({ args, canvas, step, userEvent }) => {

    // //horrid little timeout to let the adapter initialise
    const pathTextbox = await canvas.findByLabelText("Param Path");
    const putDataTextBox = await canvas.findByLabelText("PUT data");
    const getButton = await canvas.findByText("GET");
    const putButton = await canvas.findByText("PUT");
    const metadataButton = await canvas.findByLabelText("get Metadata");

    await step("Initialisation", async () => {
      await new Promise(res => setTimeout(res, 2000));
      await expect(args.endpoint.data, "Data Init").not.toEqual({});
      await expect(args.endpoint.apiVersion, "Api Version").toEqual("0.1");
    });
    
    await step("Get Requests", async () => {
      let path = "deep/long/nested/path";
      await userEvent.type(pathTextbox, path);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), `get: ${path}`)
        .resolves.toEqual({
          path: {
            val: "Deep Text",
            num_val: 12.5
          }
        });
      
      path = "";
      await userEvent.clear(pathTextbox);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), "get: Adapter Root")
        .resolves.toHaveProperty("string_val");
      
      path = "invalid";
      await userEvent.type(pathTextbox, path);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), `get: ${path}`)
        .rejects.toThrow(`GET request failed with status 400 : Invalid Path: ${path}`);

      path = "data/set_data";
      await userEvent.clear(pathTextbox)
      await userEvent.type(pathTextbox, path);
      await userEvent.click(metadataButton);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path, {wants_metadata: true}), "Get: Metadata")
        .resolves.toHaveProperty("set_data.writeable", true);

    });

    await step("Put Requests", async () => {
      
      await userEvent.clear(pathTextbox);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"string_val\": \"Put Test\"}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"string_val": "Put Test"}), "Put: String Val")
        .resolves.toHaveProperty("string_val", "Put Test");

      let path = "deep/long/nested/path";
      await userEvent.clear(pathTextbox);
      await userEvent.type(pathTextbox, path);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"num_val\": 16.5}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"num_val": 16.5}, path), "Put: Nested Val")
        .resolves.toEqual({
          path: {
            val: "Deep Text",
            num_val: 16.5
          }
        });
      await userEvent.clear(pathTextbox);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"rand_num\": 55}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"rand_num": 55}))
        .rejects.toThrow("PUT request failed with status 400 : Parameter rand_num is read-only");
    });
  }
};

export const UpdatedOdin: Story = {
  args: {
    adapter: "test",
    endpoint_url: "http://localhost:1338"
  },
  play: async ({ args, canvas, step, userEvent }) => {

    // //horrid little timeout to let the adapter initialise
    const pathTextbox = await canvas.findByLabelText("Param Path");
    const putDataTextBox = await canvas.findByLabelText("PUT data");
    const getButton = await canvas.findByText("GET");
    const putButton = await canvas.findByText("PUT");
    const metadataButton = await canvas.findByLabelText("get Metadata");

    await step("Initialisation", async () => {
      await new Promise(res => setTimeout(res, 2000));
      await expect(args.endpoint.data, "Data Init").not.toEqual({});
      await expect(args.endpoint.apiVersion, "Api Version").toEqual("");
    });
    
    await step("Get Requests", async () => {
      let path = "deep/long/nested/path";
      await userEvent.type(pathTextbox, path);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), `get: ${path}`)
        .resolves.toEqual({
          val: "Deep Text",
          num_val: 12.5
        });
      
      path = "deep/long/nested/path/num_val";
      await userEvent.type(pathTextbox, "/path");
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), "get: Single Val")
        .resolves.toEqual({
          value: 12.5
        });

      path = "";
      await userEvent.clear(pathTextbox);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), "get: Adapter Root")
        .resolves.toHaveProperty("string_val");
      
      path = "invalid";
      await userEvent.type(pathTextbox, path);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path), `get: ${path}`)
        .rejects.toThrow(`GET request failed with status 400 : Invalid Path: ${path}`);

      path = "data/set_data";
      await userEvent.clear(pathTextbox)
      await userEvent.type(pathTextbox, path);
      await userEvent.click(metadataButton);
      await userEvent.click(getButton);
      await expect(args.endpoint.get(path, {wants_metadata: true}), "Get: Metadata")
        .resolves.toHaveProperty("writeable", true);

    });

    await step("Put Requests", async () => {
      
      await userEvent.clear(pathTextbox);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"string_val\": \"Put Test\"}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"string_val": "Put Test"}), "Put: String Val")
        .resolves.toHaveProperty("string_val", "Put Test");

      let path = "float_val";
      await userEvent.clear(pathTextbox);
      await userEvent.type(pathTextbox, path);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"value\": 15.5}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"value": 15.5}, "float_val"), "Put: Single Val")
        .resolves.toEqual({
          value: 15.5
        });

      path = "deep/long/nested/path";
      await userEvent.clear(pathTextbox);
      await userEvent.type(pathTextbox, path);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"num_val\": 16.5}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"num_val": 16.5}, path), "Put: Nested Val")
        .resolves.toEqual({
          val: "Deep Text",
          num_val: 16.5
        });
      await userEvent.clear(pathTextbox);
      await userEvent.clear(putDataTextBox);
      await userEvent.type(putDataTextBox, "{{\"rand_num\": 55}");
      await userEvent.click(putButton);
      await expect(args.endpoint.put({"rand_num": 55}))
        .rejects.toThrow("PUT request failed with status 400 : Parameter rand_num is read-only");
    });
  }
}