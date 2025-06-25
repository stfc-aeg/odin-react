import type { AxiosRequestConfig } from "axios";
import type {Layout} from "plotly.js"

/**
 * Typedef for a JSON style object.
 */
export type JSON = string | number | boolean | null | undefined | JSON[] | NodeJSON;

export type NodeJSON = {[key:string]: JSON};

/**ParamTree is a type that behaves like the JSON response from an Endpoint. Extend this to create
 * an interface declaring the known structure of your Paramter Tree response, and pass that
 * to the useAdapterEndpoint hook to define your data's structure
 */
export type ParamTree = NodeJSON;

/**
 * type guard function, required to check typing of custom ParamNode objects.
 * @param x a JSON object that is either a key/value pair(s) or a basic JSON value
 * @returns boolean, true if x has key(s), false otherwise
 */
export const isParamNode = (x: JSON): x is NodeJSON => {
    return x !== null && typeof x === 'object' && !Array.isArray(x)};

export type ErrorState = null | Error;
// export type LoadingState = "getting" | "putting" | "posting" | "deleting" | "idle";

export interface getConfig {
    wants_metadata?: boolean;
    responseType?: AxiosRequestConfig['responseType'];
}

export interface AdapterEndpoint_t<T = NodeJSON> {
    /**
     *  Recursive Nested dictionary structure representing the adapter Param Tree. Should be read only
     * from this interface
     */
    data: Readonly<T>;

    /**
     * Dictionary structure containing the adapter Metadata, if its implimented by the adapter
     */
    metadata: Readonly<NodeJSON>;
    /**
     *  Any Errors that occur during http methods or otherwise will be accessible here
     */
    error: ErrorState;
    /**
     * State of the http client connection to the adapter. 
     * If true, the AdapterEndpoint is awaiting a response from the adapter.
     */
    loading: boolean;

    /**
     * Flag token that will change whenever the data has changed, to alert WithEndpoint components
     */
    updateFlag: symbol;
    /**
     * Async http GET method. Request the provided value(s) from the parameter tree.
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {string} [param_path=""] - the path of the data desired. defaults to an Empty String to get the entire param tree
     * @param {boolean} [get_metadata] - set to true to request Metadata. Defaults to false
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    get: <T = NodeJSON>(param_path?: string, config?: getConfig) => Promise<T>;
    /**
     * Async http PUT method. Modify the data in the param tree at the provided path
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {NodeJSON} data - The data, with a key, that you wish to PUT to the Param Tree
     * @param {string} param_path - the path you want to PUT to. Defaults to an empty string for a top level PUT
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    put: (data: NodeJSON, param_path?: string) => Promise<NodeJSON>;

    /**
     * Async http POST method. Not often implemented by Adapters, but potentially used to post data
     * files or some other new data to the adapter
     * @param {NodeJSON} data - The data, with a key, that you wish to POST to the adapter
     * @param param_path  - the path you want to POST to. defaults to an empty string, for a top level POST
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    post: (data: NodeJSON, param_path?: string) => Promise<NodeJSON>;

    /**
     * Async http DELETE method. Renamed because 'delete' is a reserved word in javascript. Not often
     * implemented by adapters.
     * @param param_path the path to the data you want to DELETE. Defaults to an empty string
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    remove: (param_path?: string) => Promise<NodeJSON>;
    /**
     * A method to automatically perform a top level GET request and refresh the AdapterEndpoint's current view of the data
     * @returns 
     */
    refreshData: () => void;
    /**
     * A method to merge one chunk of (potentially nested) data into the AdapterEndpoint's current view of the data,
     * to update the data without having to GET from the entire adapter
     * @param {NodeJSON} newData - The new data to be merged in
     * @param {string} param_path - the location that data within the ParamTree to merge it
     * @returns 
     */
    mergeData: (newData: NodeJSON, param_path: string) => void;

}

export interface Log extends NodeJSON {
    level?: "debug" | "info" | "warning" | "error" | "critical";
    timestamp: string;
    message: string;
}

export interface GraphData {
    data: number[];
    axis?: number;
}

export interface Axis {
    side?: Layout["yaxis"]["side"];
    range?: [number, number];
    invert?: boolean;
    title?: Layout["yaxis"]["title"];
    visible?: boolean;
}

export const isGraphData = (x: object[]): x is GraphData[] => {
    return "data" in x[0] && Array.isArray(x[0].data) && typeof x[0].data[0] === "number"
}
