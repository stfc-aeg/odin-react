import { fn } from 'storybook/test';

import defaultImg from '../../assets/testImage.png';

import type { AdapterEndpoint_t, ParamTree } from '../../main';
import { getValueFromPath } from '../AdapterEndpoint';

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

interface endpointData_t extends ParamTree {
    frame?: {
        frame_num: number;
    }
    colormap_options?: Record<string, string>;
    colormap_selected?: string;
    data_min_max?: [number, number];
    clip_range?: [number, number];
}

const endpointData_standard: endpointData_t = {
  frame: {
      frame_num: 12
  },
  colormap_options: {"test": "Test", "blue": "Blue"},
  colormap_selected: "test",
  data_min_max: [0, 1024],
  clip_range: [0, 1024]

};

const endpointData_noControls: endpointData_t = {
    
}

const endpointData_noClip: endpointData_t = {
  frame: {
      frame_num: 12
  },
  colormap_options: {"test": "Test", "blue": "Blue"},
  colormap_selected: "test",
}

const endpointData_noFrame: endpointData_t = {
  colormap_options: {"test": "Test", "blue": "Blue"},
  colormap_selected: "test",
  data_min_max: [0, 1024],
  clip_range: [0, 1024]
}

const genericGet = (data : ParamTree) => {
  
  const get = async <T = ParamTree>(param_path = "", config?: getConfig): Promise<T> => {
    let result: T;
    if(config?.responseType == "blob"){
      result = imgBlob as T;
    }
    else{
      result = getValueFromPath<T>(data, param_path);
    }
    return result;
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

const getMockedEndpoint = <T extends ParamTree>(data: T) => {
  const endpoint: AdapterEndpoint_t<T> = {
    data: data,
    metadata: data,
    error: null,
    loading: false,
    updateFlag: Symbol("mocked"),
    get: fn(genericGet(data)),
    put: fn(put),
    post: fn(),
    remove: fn(),
    refreshData: fn(() => {}),
    mergeData: fn((newData: ParamTree, param_path: string) => {})
  }
  return endpoint;
}

export const MockEndpoint_standard = getMockedEndpoint(endpointData_standard);
export const MockEndpoint_noControls = getMockedEndpoint(endpointData_noControls);
export const MockEndpoint_noClip = getMockedEndpoint(endpointData_noClip);
export const MockEndpoint_noFrame = getMockedEndpoint(endpointData_noFrame);


