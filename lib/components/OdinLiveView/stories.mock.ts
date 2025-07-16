import { fn } from 'storybook/test';

import defaultImg from '../../assets/testImage.png';

import type { AdapterEndpoint_t, ParamTree } from '../../main';
import { getValueFromPath } from '../../helpers/utils';

type ResponseType =
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';

interface getConfig {
    wants_metadata?: boolean;
    responseType?: ResponseType;
}

const imgBlob = await fetch(defaultImg).then(response => {return response.blob()})

interface endpointData_standard_t extends ParamTree {
    frame: {
        frame_num: number;
    }
    colormap_options: Record<string, string>;
    colormap_selected: string;
    data_min_max: [number, number];
    clip_range: [number, number];
}

interface endpointData_noControls_t extends ParamTree {
    unused: string;
}

const endpointData_standard: endpointData_standard_t = {
  frame: {
      frame_num: 12
  },
  colormap_options: {"test": "Test", "blue": "Blue"},
  colormap_selected: "test",
  data_min_max: [0, 1024],
  clip_range: [0, 1024]

};

const endpointData_noControls: endpointData_noControls_t = {
    unused: "test"
}

const genericGet = (data : ParamTree) => {
  
  const get = async <T = ParamTree>(param_path='', config?: getConfig) => {
    if(config?.responseType == "blob"){
      return imgBlob as T;
    }
    else{
      return getValueFromPath(data, param_path) as T;
    }
  }

  return get;
}

const put = async (data: ParamTree, param_path?: string) => {
  // const val = getValueFromPath(endpointData_standard, param_path);
  if(param_path == ""){
    return data;
  }
  else return data;

}


export const MockEndpoint_standard: AdapterEndpoint_t<endpointData_standard_t> = {
  data: endpointData_standard,
  metadata: {},
  error: null,
  loading: false,
  updateFlag: Symbol("mocked"),
  get: fn(genericGet(endpointData_standard)),
  put: fn(put),
  post: fn(),
  remove: fn(),
  refreshData: fn(() => {}),
  mergeData: fn((newData: ParamTree, param_path: string) => {})
}

export const MockEndpoint_noControls: AdapterEndpoint_t<endpointData_noControls_t> = {
  data: endpointData_noControls,
  metadata: {},
  error: null,
  loading: false,
  updateFlag: Symbol("mocked"),
  get: fn(genericGet(endpointData_noControls)),
  put: fn(put),
  post: fn(),
  remove: fn(),
  refreshData: fn(() => {}),
  mergeData: fn((newData: ParamTree, param_path: string) => {})
} 