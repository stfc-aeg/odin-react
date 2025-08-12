import { http, HttpResponse, delay, HttpResponseResolver, DefaultBodyType} from 'msw';

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
    },
    select_list: ["item 1", "item 2", "item 3"],
    selected: "item 1",
    toggle: true
}

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
    frame: {},
    frame_counts: {
        "tcp://127.0.0.1:5020": 0
    }
}

let ApiData = {
  Test: TestAdapterData,
  live_view: LiveViewAdapterData
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
  if(params.adapter in ApiData){
    const adapter = params.adapter as keyof typeof ApiData;

    const wants_metadata = request.headers.get("accept")?.includes("metadata=true") ?? false;
    const targetTree = wants_metadata ? createMetadata(ApiData[adapter]) : ApiData[adapter];
    if(params.path){
      if(adapter == "live_view" && params.path[0] == "image"){
        return new HttpResponse(imgBlob, {headers: {"Content-Type": 'image/png'}, status: 200})
      }
      const path = params.path.join("/");
      const value = getValueFromPath(targetTree as JSON, path);
      if(value !== undefined){
        const returnVal = { [params.path[params.path.length - 1]]: value};
        return HttpResponse.json(returnVal);
      }else{
        return new HttpResponse({"error": `Invalid path: ${path}`}, {status: 400});
      }
    }else{
      return HttpResponse.json(targetTree); 
    }
  }else{
    return new HttpResponse(`No API adapter registered for subsystem ${params.adapter}`, {status: 400});
  }
}

const putHandler: HttpResponseResolver<{adapter: string, path?: string[]}, DefaultBodyType, undefined> = async ({params, request}) => {
  const path = params.path ? params.path.join("/") : "";
  const adapter = params.adapter as keyof typeof ApiData;
  const clonedPut = request.clone();
  const body = await clonedPut.json();
  console.log(body, clonedPut.headers);
  // const mergedPutResponse = mergeData(ApiData[adapter], body, path);
  // console.log(mergedPutResponse);
  ApiData = {[params.adapter]: mergeData(ApiData[adapter], body, path)} as typeof ApiData;
  console.log(ApiData);
  if(params.path){
    console.log(path);
    return HttpResponse.json({[params.path[params.path.length - 1]]: getValueFromPath(ApiData[adapter], path)});
  }else{
    return HttpResponse.json(ApiData[adapter]); 
  }
}

export {getHandler, putHandler}