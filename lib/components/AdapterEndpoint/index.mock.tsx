import { fn } from 'storybook/test';
import { createMetadata } from '../../../.storybook/api.mock';
import * as actual from '.';
import type { AdapterEndpoint, ParamTree, ParamNode, Parameter } from '.';
import type { MetadataValue } from './AdapterEndpoint.types';

import defaultImg from '../../assets/testImage.png';
import { StoryContext } from '@storybook/react-vite';

const imgBlob = await fetch(defaultImg).then(response => { return response.blob() });

export interface EndpointData extends actual.ParamNode {
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
    volt: number;
    graph_data: number[];
}

interface LiveViewData extends actual.ParamNode {
    frame: {
        frame_num: number;
    }
    colormap_options: Record<string, string>;
    colormap_selected: string;
    data_min_max: [number, number];
    clip_range: [number, number];
}

const generateRandomNumber = () => {
    return Math.round(Math.random()*100)
}

const testAdapterData: EndpointData = {
    string_val: "String Value Test",
    num_val: 25,
    float_val: 1.5,
    rand_num: generateRandomNumber(),
    data: {
        set_data: 10,
        clip_data: [-10, 5],
        dict: {
            half: 10 / 2,
            is_even: !(10 % 2)
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
    trigger: null,
    graph_data: Array.from(Array(360), (_, x) => Math.sin(x * (Math.PI / 180))),
    volt: 1500
}

const testLiveData: LiveViewData = {
    clip_range: [0, 1023 ],
    data_min_max: [0, 1023],
    frame: {frame_num: 12},
    colormap_options: {
        "jet": "Jet",
        "bone": "Bone",
        "cool": "Cool",
        "hot": "Hot"
    },
    colormap_selected: "jet"
}

const originalData = structuredClone(testAdapterData);

const metadataPaths: { [key: string]: Partial<MetadataValue> } = {
    "selected": { allowed_values: ["item 1", "item 2", "item 3"] },
    "num_val": { min: 10, max: 90 },
    "clip_data": {min: -25, max: 25},
    "rand_num": { writeable: false },
    "dict": { writeable: false, type: "dict" },
    "volt": {min: 100, max: 5000, units: "mV", name: "Voltage" }
}

const testMetadata = createMetadata(testAdapterData, metadataPaths);


export * from '.'

async function mockGet<T = ParamNode>(param_path?: string, config?: { wants_metadata?: boolean }) {
    if(param_path == "image"){
        return imgBlob;
    }
    const wants_metadata = config?.wants_metadata ?? false;

    let pointer: ParamTree = wants_metadata ? testAdapterData : testMetadata;
    const splitPath = param_path?.split("/");
    splitPath?.forEach((part) => {
        pointer = (pointer as ParamNode)[part];
    });
    if (actual.isParamNode(pointer)) {
        return pointer as T;
    } else {
        return { value: pointer } as T;
    }
}

function mockPut<T = Parameter>(data: { [key: string]: T }, param_path = '') {
    console.debug("Mock Put Called: ", data, param_path);
    let pointer: ParamNode = testAdapterData;
    const splitPath = param_path.split("/");
    let dataCopy: { [key: string]: T };

    if ("value" in data && Object.keys(data).length == 1) {
        dataCopy = { [splitPath.pop()!]: data.value }
    } else {
        dataCopy = data;
    }

    splitPath.forEach((part) => {
        if (actual.isParamNode(pointer[part])) {
            pointer = pointer[part];
        }
    })

    Object.keys(dataCopy).forEach((key) => {
        if (pointer[key] != null) {
            Object.assign(pointer, { [key]: dataCopy[key] });
        }
    })
    if ("value" in data && Object.keys(data).length == 1) {
        pointer = { value: pointer[param_path.split("/").pop()!] };
    }
    console.debug("Returning: ", pointer);
    return pointer;

}

const resetMockData = () => {
    Object.assign(testAdapterData, originalData);
}


const MockedEndpoint: AdapterEndpoint<EndpointData> = {
    // @ts-ignore
    get: fn(mockGet).mockName("get"),
    // @ts-ignore
    put: fn(mockPut).mockName("put"),
    post: fn().mockName("post"),
    remove: fn(),
    refreshData: fn(),
    mergeData: fn(),
    data: testAdapterData,
    metadata: testMetadata,
    status: "connected",
    apiVersion: "",
    error: null,
    loading: false,
    updateFlag: Symbol("mocked")
}

const MockedLiveEndpoint: AdapterEndpoint<LiveViewData> = {
    // @ts-ignore
    get: fn(mockGet).mockName("get"),
    // @ts-ignore
    put: fn(mockPut).mockName("put"),
    post: fn().mockName("post"),
    remove: fn(),
    refreshData: fn(),
    mergeData: fn(),
    data: testLiveData,
    // @ts-ignore
    metadata: testLiveData,
    status: "connected",
    apiVersion: "",
    error: null,
    loading: false,
    updateFlag: Symbol("mocked")

}

const MockedLiveEndpointNoControls: AdapterEndpoint<{}> = {
    // @ts-ignore
    get: fn(mockGet).mockName("get"),
    // @ts-ignore
    put: fn(mockPut).mockName("put"),
    post: fn().mockName("post"),
    remove: fn(),
    refreshData: fn(),
    mergeData: fn(),
    data: {},
    // @ts-ignore
    metadata: {},
    status: "connected",
    apiVersion: "",
    error: null,
    loading: false,
    updateFlag: Symbol("mocked")
}

const useAdapterEndpoint = fn(
    (..._: any[]) => { return MockedEndpoint }
).mockName('useAdapterEndpoint');

const useAdapterEndpoint_LiveView = fn(
    (..._: any[]) => { return MockedLiveEndpoint}
).mockName("useAdapterEndpoint");

const userAdapterEndpoint_LiveView_noControls = fn(
    (..._: any[]) => { return MockedLiveEndpointNoControls }
).mockName("useAdapterEndpoint");

const transformMockCode = async (source: string, _?: StoryContext, adapterName: string = "test") => {
    const prettier = await import('prettier/standalone');
    const prettierPluginBabel = await import('prettier/plugins/babel');
    const prettierPluginEstree = await import('prettier/plugins/estree');

    const addEndpointString = `const endpoint = useAdapterEndpoint("${adapterName}", import.meta.env.VITE_ENDPOINT_URL);`
    let ret_string = source;
    if (!(source.split("\n")[0].includes("const endpoint"))) {
        ret_string = [addEndpointString,
            "",
            "return (",
            source.replaceAll(/endpoint={{[\s\S]*?updateFlag: Symbol\(mocked\),?\s*}}/g, ` endpoint={endpoint}`),
            ")"].join("\n");
    }

    return prettier.format(ret_string, {
        parser: 'babel-ts',
        plugins: [prettierPluginBabel, prettierPluginEstree]
    });
    // return addEndpointString.concat("test");
}

export { useAdapterEndpoint, useAdapterEndpoint_LiveView, userAdapterEndpoint_LiveView_noControls};
export { resetMockData, transformMockCode };
// export {testAdapterData};

