// typedef for param tree leaf nodes
export type paramLeaf = string | number | boolean;

//paramNode is the nested dict type designed to represent the various nodes of the Parameter Tree
export type paramNode = {[key: string]: paramLeaf | paramLeaf[] | paramNode};

//type guard function, required to check typing of custom ParamNode objects.
export const isParamNode = (x: any): x is paramNode => typeof x === 'object'

export type ErrorState = null | Error;
export type LoadingState = "getting" | "putting" | "idle";

export interface AdapterEndpoint_t {
    /**
     *  Recursive Nested dictionary structure representing the adapter Param Tree. Should be read only
     * from this interface
     */
    data: paramNode;
    /**
     *  Any Errors that occur during http methods or otherwise will be accessible here
     */
    error: ErrorState;
    /**
     * State of the http client connection to the adapter. 
     *  - "getting" means currently waiting for a response from a GET request
     *  - "putting" means currently waiting for a response from a PUT request
     *  - "idle" means not currently doing anything
     */
    loading: LoadingState;
    /**
     * Async http GET method. Request the provided value(s) from the parameter tree.
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {string} [param_path=""] - the path of the data desired. defaults to an Empty String to get the entire param tree
     * @param {boolean} [get_metadata] - set to true to request Metadata. Defaults to false
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    get: (param_path?: string, get_metadata?: boolean) => Promise<paramNode>;
    /**
     * Async http PUT method. Modify the data in the param tree at the provided path
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {Object<String, paramNode>} data - The data, with a key, that you wish to PUT to the Param Tree
     * @param {string} param_path - the path you want to PUT to. Defaults to an empty string for a top level PUT
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    put: (data: Object, param_path?: string) => Promise<paramNode>;
    /**
     * A method to automatically perform a top level GET request and refresh the AdapterEndpoint's current view of the data
     * @returns 
     */
    refreshData: () => void;
    /**
     * A method to merge one chunk of (potentially nested) data into the AdapterEndpoint's current view of the data,
     * to update the data without having to GET from the entire adapter
     * @param {paramNode} newData - The new data to be merged in
     * @param {string} param_path - the location that data within the ParamTree to merge it
     * @returns 
     */
    mergeData: (newData: paramNode, param_path: String) => void;

}