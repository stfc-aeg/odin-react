import type { Meta, StoryObj } from '@storybook/react-vite';

import { getValueFromPath, isParamNode, useAdapterEndpoint } from './index';

import type { NodeJSON, JSON } from './index';

import { http, HttpResponse, delay, HttpResponseResolver, DefaultBodyType} from 'msw';
import { FloatingLabel, InputGroup, Form, Card, ButtonGroup, Button } from 'react-bootstrap';
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
      Endpoint.data
    <pre style={{border: "1px solid black"}}>
      <code>
        {JSON.stringify(endpoint.data, undefined, 2)}
      </code>
      <code>
        {JSON.stringify(endpoint.metadata, undefined, 2)}
      </code>
    </pre>
    </Card.Body>
    </Card>
  )
}

const mergeData = (target: NodeJSON, source: NodeJSON, path: string) => {
    const splitPath = path.split("/");
    const tmpData = target;
    let pointer: JSON = tmpData;

    if(splitPath[0]) {
      splitPath.forEach((part_path) => {
        pointer = (pointer as NodeJSON)[part_path];
      })
    }
    Object.assign(pointer, source);
    return tmpData;
  }

const meta = {
  component: EndpointDisplay,
} satisfies Meta<typeof useAdapterEndpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

type MetaNum = "int" | "float" | "complex";
type MetaList = "list" | "tuple" | "range";

interface metadata {
  value: JSON;
  writeable: boolean;
  type: MetaNum | MetaList | "str" | "bool" | "NoneType";
  min?: number;
  max?: number;
}

let TestData = { 
  Test: {
    string_val: "String Value Test",
    num_val: 42,
    deep: {
        long: {
            nested: {
                dict: {
                    path: {
                        val: "Deep Text",
                        num_val: 12.5
                    }
                }
            }
        }
    }
  }
}

const createMetadata = (data: NodeJSON) => {
  let return_data: {[key: keyof typeof data]: metadata | typeof return_data} = {};
  for(const [key, val] of Object.entries(data)) {
    if(isParamNode(val)){
      return_data[key] = createMetadata(val);
    }else{
      let type: metadata['type'] = "str";
      switch(typeof val){
        case "number":
          type = Number.isInteger(val) ? "int" : "float";
          break;
        case "boolean":
          type = "bool";
          break;
        case "object":
          type = Array.isArray(val) ? "list" : "NoneType";
      }
      return_data[key] = {
        value: val,
        writeable: true,
        type: type
      }
    }
  }

  return return_data;
}

const getHandler: HttpResponseResolver<{adapter: string, path?: string[]}, DefaultBodyType, undefined> = ({params, request}) => {
  console.log(request);
  const adapter = params.adapter as keyof typeof TestData;

  const wants_metadata = request.headers.get("accept")?.includes("metadata=true") ?? false;
  const targetTree = wants_metadata ? createMetadata(TestData[adapter]) : TestData[adapter];
  if(params.path){
    const path = params.path.join("/");
    const returnVal = { [params.path[params.path.length - 1]]: getValueFromPath(targetTree, path)};
    return HttpResponse.json(returnVal);
  }else{
    return HttpResponse.json(targetTree); 
  }
}

const putHandler: HttpResponseResolver<{adapter: string, path?: string[]}, DefaultBodyType, undefined> = async ({params, request}) => {
  const path = params.path ? params.path.join("/") : "";
  const adapter = params.adapter as keyof typeof TestData;
  const clonedPut = request.clone();
  const body = await clonedPut.json();
  console.log(body, clonedPut.headers);
  // const mergedPutResponse = mergeData(TestData[adapter], body, path);
  // console.log(mergedPutResponse);
  TestData = {[params.adapter]: mergeData(TestData[adapter], body, path)} as typeof TestData;
  console.log(TestData);
  if(params.path){
    console.log(path);
    return HttpResponse.json({[params.path[params.path.length - 1]]: getValueFromPath(TestData[adapter], path)});
  }else{
    return HttpResponse.json(TestData[adapter]); 
  }
}

export const Default: Story = {
  args: {
    adapter: "Test",
    endpoint_url: "http://localhost:1337"
  },
  parameters: {
    msw: {
      handlers: [
        http.get<{adapter: string}>("http://localhost:1337/api/0.1/:adapter", getHandler),
        http.get<{adapter: string, path: string[]}>("http://localhost:1337/api/0.1/:adapter/:path+", getHandler),
        // PUT REQUEST HANDLING
        http.put<{adapter: string}>("http://localhost:1337/api/0.1/:adapter", putHandler),
        http.put<{adapter: string, path: string[]}>("http://localhost:1337/api/0.1/:adapter/:path+", putHandler)
      ]
    }
  }
};