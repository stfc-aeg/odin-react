import type { AxiosRequestConfig } from "axios";

type status = "init" | "connected" | "error";

interface AdapterEndpoint<T = NodeJSON> {
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
    error: null | Error;
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
     * Connection status for the AdapterEndpoint.
     */
    status: status;
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

/**
 * Defines allowed values for JSON dict.
 */
type JSON = string | number | boolean | null | undefined | JSON[] | NodeJSON;

/**
 * JSON Dict, defines key/value pairing.
 */
type NodeJSON = {[key:string]: JSON};

interface getConfig {
    wants_metadata?: boolean;
    responseType?: AxiosRequestConfig['responseType'];
}

export type { AdapterEndpoint, JSON, NodeJSON, getConfig, status};

/**
 * @deprecated This is the old name for this type and should be replaced with "AdapterEndpoint"
 */
export type AdapterEndpoint_t<T> = AdapterEndpoint<T>;