import { http, HttpResponse, delay, HttpResponseResolver, DefaultBodyType} from 'msw';
import { action } from 'storybook/actions';

import { getValueFromPath, isParamNode } from '../lib/components/AdapterEndpoint';
import type { NodeJSON, JSON } from '../lib/components/AdapterEndpoint';

import defaultImg from '../lib/assets/testImage.png';

type MetaNum = "int" | "float" | "complex";
type MetaList = "list" | "tuple" | "range";

interface metadata {
  value: JSON;
  writeable: boolean;
  type: MetaNum | MetaList | "str" | "bool" | "NoneType";
  min?: number;
  max?: number;
}

const imgBlob = await fetch(defaultImg).then(response => {return response.blob()})

let TestAdapterData = {
  string_val: "String Value Test",
    num_val: 42,
    two_num: [12, 48],
    deep: {
        long: {
            nested: {
                dict: {
                    path: {
                        val: "Deep Text",
                        num_val: 12.5,
                        readOnly: "Can't Be Changed"
                    }
                }
            }
        }
    },
    select_list: ["item 1", "item 2", "item 3"],
    selected: "item 1",
    toggle: true,
    trigger: null
}

export type TestAdapterInterface = typeof TestAdapterData;

let LiveViewAdapterData = {
  clip_range: [
        null,
        null
    ],
    colormap_options: {
        "autumn": "Autumn",
        "bone": "Bone",
        "cool": "Cool",
        "hot": "Hot",
        "hsv": "HSV",
        "jet": "Jet",
        "ocean": "Ocean",
        "parula": "Parula",
        "pink": "Pink",
        "rainbow": "Rainbow",
        "spring": "Spring",
        "summer": "Summer",
        "winter": "Winter"
    },
    colormap_selected: "jet",
    data_min_max: [
        0,
        1023
    ],
    endpoints: [
        "tcp://127.0.0.1:5020"
    ],
    frame: {frame_num: 12},
    frame_counts: {
        "tcp://127.0.0.1:5020": 0
    }
}

let {colormap_options, colormap_selected, ...LiveViewNoColormapData} = LiveViewAdapterData;
let {clip_range, data_min_max, ...LiveViewNoClip} = LiveViewAdapterData;

let OtherTestData = {
  other_string: "Other String"
}

let LoggingTestData = {
  events: [
    {
        "level": "DEBUG",
        "message": "Random Number: 64",
        "timestamp": "2025-08-18T17:15:18.625680"
    },
    {
        "level": "DEBUG",
        "message": "Random Number: 70",
        "timestamp": "2025-08-18T17:15:38.626060"
    },
    {
        "level": "ERROR",
        "message": "Random Number below 30: 12",
        "timestamp": "2025-08-18T17:15:58.625833"
    },
    {
        "level": "INFO",
        "message": "Random Number below 60: 57",
        "timestamp": "2025-08-18T17:16:18.625657"
    },
    {
        "level": "WARNING",
        "message": "Random Number below 50: 37",
        "timestamp": "2025-08-18T17:16:38.625653"
    },
    {
        "level": "CRITICAL",
        "message": "Random Number below 10: 8",
        "timestamp": "2025-08-18T17:16:58.626215"
    },
    {
        "level": "DEBUG",
        "message": "Random Number: 91",
        "timestamp": "2025-08-18T17:17:18.625343"
    },
    {
        "level": "CRITICAL",
        "message": "Random Number below 10: 3",
        "timestamp": "2025-08-18T17:17:38.625410"
    },
    {
        "level": "CRITICAL",
        "message": "Random Number below 10: 8",
        "timestamp": "2025-08-18T17:17:58.625477"
    },
    {
        "level": "DEBUG",
        "message": "Random Number: 64",
        "timestamp": "2025-08-18T17:18:18.625553"
    },
    {
        "level": "DEBUG",
        "message": "Random Number: 100",
        "timestamp": "2025-08-18T17:18:38.625523"
    },
    {
        "level": "DEBUG",
        "message": "Random Number: 72",
        "timestamp": "2025-08-18T17:18:58.625989"
    }

  ]
}

let ApiData = {
  Test: TestAdapterData,
  live_view: LiveViewAdapterData,
  live_view_nc: LiveViewNoColormapData,
  live_view_clipless: LiveViewNoClip,
  Logger: LoggingTestData
}

const readOnlyPaths = ["select_list", "deep/long/nested/dict/path/readOnly"]

const mergeData = (target: NodeJSON, source: NodeJSON, path: string) => {
    const splitPath = path.split("/").slice(0, -1);
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

const createMetadata = (data: NodeJSON, path="") => {
  let return_data: {[key: keyof typeof data]: metadata | typeof return_data} = {};
  for(const [key, val] of Object.entries(data)) {
    const curPath = path ? [path, key].join("/") : key;
    if(isParamNode(val)){
      return_data[key] = createMetadata(val, curPath);
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
        writeable: !readOnlyPaths.includes(curPath),
        type: type
      }
    }
  }

  return return_data;
}


const getHandler: HttpResponseResolver<{adapter: string, path?: string[]}, DefaultBodyType, undefined> = ({params, request}) => {
  console.log("GET REQUEST");
  console.log(ApiData);
  if(params.adapter in ApiData){
    const adapter = params.adapter as keyof typeof ApiData;
    const wants_metadata = request.headers.get("accept")?.includes("metadata=true") ?? false;
    const targetTree = wants_metadata ? createMetadata(ApiData[adapter]) : ApiData[adapter];
    if(params.path){
      if(adapter.includes("live_view") && params.path[0] == "image"){
        action("Get Request: Image Blob")(adapter);
        return new HttpResponse(imgBlob, {headers: {"Content-Type": 'image/png'}, status: 200})
      }
      const path = params.path.join("/");
      const value = getValueFromPath(targetTree as JSON, path);
      if(value !== undefined){
        const returnVal = { [params.path[params.path.length - 1]]: value};
        action("Get Request")(adapter, path);
        return HttpResponse.json(returnVal);
      }else{
        action("Get Request: INVALID PATH")(adapter, path);
        return new HttpResponse({"error": `Invalid path: ${path}`}, {status: 400});
      }
    }else{
      action("Get Request")(adapter);
      return HttpResponse.json(targetTree); 
    }
  }else{
    action("Get Request: INVALID ADAPTER NAME")(params.adapter);
    return new HttpResponse(`No API adapter registered for subsystem ${params.adapter}`, {status: 400});
  }
}

const putHandler: HttpResponseResolver<{adapter: string, path?: string[]}, Record<string, any>, undefined> = async ({params, request}) => {
  const adapter = params.adapter as keyof typeof ApiData;
  const clonedPut = request.clone();
  const body = await clonedPut.json() as Record<string, any>;
  const path = params.path ? [...params.path, Object.keys(body)[0]].join("/") : Object.keys(body)[0];
  if(!(params.adapter in ApiData)){
    action("Put Request: FAIL INVALID ADAPTER NAME")(params.adapter);
    return new HttpResponse(`No API adapter registered for subsystem ${params.adapter}`, {status: 400});
  }
  if(readOnlyPaths.includes(path)){
    action("Put Request: FAIL READONLY")(adapter, path, body);
    return  HttpResponse.json({"error": `Parameter ${path} is readonly`}, {status: 400})
  }
  action("Put Request")(adapter, path, body);

  Object.assign(ApiData, {[adapter]: mergeData(ApiData[adapter], body, path)});
  if(params.path){
    console.log(path);
    return HttpResponse.json({[params.path[params.path.length - 1]]: getValueFromPath(ApiData[adapter], path)});
  }else{
    return HttpResponse.json(ApiData[adapter]); 
  }
}

export {getHandler, putHandler}