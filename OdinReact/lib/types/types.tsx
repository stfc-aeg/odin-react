// typedef for param tree leaf nodes
export type paramLeaf = string | number | null | boolean;

//paramNode is the nested dict type designed to represent the various nodes of the Parameter Tree
export type paramNode = {[key: string]: paramLeaf | paramLeaf[] | paramNode};

//type guard function, required to check typing of custom ParamNode objects.
export const isParamNode = (x: any): x is paramNode => typeof x === 'object'

export type ErrorState = null | Error;
export type LoadingState = "getting" | "putting" | "idle";

export interface AdapterEndpoint_t {
    data: paramNode;
    error: ErrorState;
    loading: LoadingState;
    get: (param_path?: string, get_metadata?: boolean) => Promise<paramNode>;
    put: (data: Object, param_path?: string) => Promise<paramNode>;
    refreshData: () => void;
    mergeData: (newData: paramNode, param_path: String) => void;

}