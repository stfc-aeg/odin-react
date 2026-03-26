import { http, HttpResponse, delay, HttpResponseResolver, DefaultBodyType, JsonBodyType } from 'msw';
import { GetRequest, PutRequest } from './actions.mock';


import type { ParamNode, ParamTree, Metadata } from '../lib/components/AdapterEndpoint';
import { MetadataValue } from '../lib/components/AdapterEndpoint/AdapterEndpoint.types';

import { OldAdapter, NewAdapter, HttpAdapter } from './api.mock';

import defaultImg from '../lib/assets/testImage.png';


interface EndpointData extends ParamNode {
  string_val: string;
  num_val: number;
  float_val: number;
  rand_num: number;
  selected: string;
  toggle: boolean;
  trigger: null;
  data: {
    set_data: number;
    dict: {
      half: number;
      is_even: boolean;
    },
    clip_data: number[];
  };
  deep: {
    long: {
      nested: {
        path: {
          val: string;
          num_val: number;
        }
      }
    }
  };
}

const imgBlob = await fetch(defaultImg).then(response => { return response.blob() })

const data_val = 10
const rand_num = 32

const testAdapterData: EndpointData = {
  string_val: "String Value Test",
  num_val: 42,
  float_val: 1.5,
  rand_num: rand_num,
  data: {
    set_data: data_val,
    clip_data: [-10, 5],
    dict: {
      half: data_val / 2,
      is_even: !(data_val % 2)
    }
  },
  deep: {
    long: {
      nested: {
        path: {
          val: "Deep Text",
          num_val: 12.5
        }
      }
    }
  },
  selected: "item 1",
  toggle: true,
  trigger: null
}

const metadataPaths: { [key: string]: Partial<MetadataValue> } = {
  "select": { allowed_values: ["item 1", "item 2", "item 3"] },
  "num_val": { min: 15, max: 76 },
  "rand_num": { writeable: false },
  "dict": { writeable: false, type: "dict" }
}

const testAdapter = new OldAdapter("test", testAdapterData, metadataPaths);
const testUpdateAdapter = new NewAdapter("test", testAdapterData, metadataPaths);

const adapters = {
  test: testAdapter
}

const update_adapters = {
  test: testUpdateAdapter
}


const apiVersionHandler: HttpResponseResolver<{ port: string }, DefaultBodyType, undefined> = ({ params, request }) => {
  // if(params.port == "1337"){
  //   return HttpResponse.json({"version": null})
  // }
  console.log("GETTING API VERSION");
  GetRequest("Api Verison", params.port);
  return params.port == "1337" ? HttpResponse.error() : HttpResponse.json({ "version": null });
}

const get_from_adapter = (adapter: string, adapter_list: { [key: string]: HttpAdapter },
  path?: string[], wantsMetadata?: boolean) => {
  if (adapter in adapter_list) {
    return adapter_list[adapter].get_response(path, wantsMetadata);
  } else {
    GetRequest("Invalid Adapter name", adapter);
    return new HttpResponse(`No API adapter registered for subsystem ${adapter}`, { status: 400 });
  }
}

const put_to_adapter = (adapter: string, adapter_list: { [key: string]: HttpAdapter },
  data: ParamNode, path?: string[]) => {
    if(adapter in adapter_list) {
      return adapter_list[adapter].put_response(data, path);
    } else {
      PutRequest("Invalid Adapter Name", adapter);
    return new HttpResponse(`No API adapter registered for subsystem ${adapter}`, { status: 400 });
    }
}
const getHandler: HttpResponseResolver<{ adapter: string, path?: string[] }, DefaultBodyType, undefined> = ({ params, request }) => {
  console.log("MOCKED GET REQUEST", params.adapter);
  const wants_metadata = request.headers.get("accept")?.includes("metadata=true") ?? false;
  return get_from_adapter(params.adapter, adapters, params.path, wants_metadata);
}

const putHandler: HttpResponseResolver<{ adapter: string, path?: string[] }, ParamNode, undefined> = async ({ params, request }) => {
  console.log("MOCKED PUT REQUEST", params.adapter)
  const requestBody = await request.clone().json();
  return put_to_adapter(params.adapter, adapters, requestBody, params.path);
}

const getHandlerUpdate: HttpResponseResolver<{ adapter: string, path?: string[] }, DefaultBodyType, undefined> = ({ params, request }) => {
  console.log("MOCKED GET REQUEST: UPDATED API", params.adapter);
  const wants_metadata = request.headers.get("accept")?.includes("metadata=true") ?? false;
  return get_from_adapter(params.adapter, update_adapters, params.path, wants_metadata);
}

const putHandlerUpdate: HttpResponseResolver<{ adapter: string, path?: string[] }, ParamNode, undefined> = async ({ params, request }) => {
  console.log("MOCKED PUT REQUEST: UPDATED API", params.adapter)
  const requestBody = await request.clone().json();
  return put_to_adapter(params.adapter, update_adapters, requestBody, params.path);
}

export { getHandler, putHandler, getHandlerUpdate, putHandlerUpdate, apiVersionHandler }
export {adapters, update_adapters};