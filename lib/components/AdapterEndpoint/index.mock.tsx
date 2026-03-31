import { fn } from 'storybook/test';
import { createMetadata } from '../../../.storybook/api.mock';
import * as actual from '.';
import type { AdapterEndpoint, ParamTree, ParamNode, Parameter } from '.';
import type { MetadataValue } from './AdapterEndpoint.types';



interface EndpointData extends actual.ParamNode {
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

const testAdapterData: EndpointData = {
    string_val: "String Value Test",
    num_val: 25,
    float_val: 1.5,
    rand_num: 32,
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
    trigger: null
}

const originalData = structuredClone(testAdapterData);

const metadataPaths: { [key: string]: Partial<MetadataValue> } = {
    "selected": { allowed_values: ["item 1", "item 2", "item 3"] },
    "num_val": { min: 10, max: 90 },
    "rand_num": { writeable: false },
    "dict": { writeable: false, type: "dict" }
}

const testMetadata = createMetadata(testAdapterData, metadataPaths);


export * from '.'

async function mockGet<T = ParamNode>(param_path?: string, config?: { wants_metadata?: boolean }) {
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
        if(pointer[key] != null){
            Object.assign(pointer, { [key]: dataCopy[key] });
        }
    })
    if ("value" in data && Object.keys(data).length == 1) {
        pointer = {value: pointer[param_path.split("/").pop()!]};
    }

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

const useAdapterEndpoint = fn(
    (..._: any[]) => { return MockedEndpoint }
).mockName('useAdapterEndpoint');

export { useAdapterEndpoint, resetMockData };
// export {testAdapterData};

