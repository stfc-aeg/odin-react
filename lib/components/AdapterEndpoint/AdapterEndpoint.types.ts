import type { AxiosRequestConfig } from "axios";

/**
 * Interface of returned values from the useAdapterEndpoint custom hook
 */
interface AdapterEndpoint
    <
        Tree extends Record<Extract<keyof Tree, string>, ParamTree> = ParamNode
    > {
    /**
     *  Recursive Nested dictionary structure representing the adapter Param Tree. Should be read only
     * from this interface
     */
    data?: Readonly<Tree>;

    /**
     * Dictionary structure containing the adapter Metadata, if its implemented by the adapter
     */
    metadata?: Readonly<Metadata<Tree>>;
    /**
     *  Any Errors that occur during http methods or otherwise will be accessible here
     */
    // error: null | Error;
    /**
     * State of the http client connection to the adapter. 
     * If true, the AdapterEndpoint is awaiting a response from the adapter.
     */
    loading: boolean;

    /**
     * Flag token that will change whenever the data has changed, to alert WithEndpoint components
     */
    // updateFlag: symbol;

    /**
     * Connection status for the AdapterEndpoint.
     */
    // status: status;

    /**
     * Api String. Used to differentiate between Odin Control versions.
     * If blank, Odin Control is v2.*
     */
    apiVersion: "" | "0.1";
    /**
     * Async http GET method. Request the provided value(s) from the parameter tree.
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {ParamPath<Tree>} [param_path=""] - the path of the data desired. defaults to an Empty String to get the entire param tree
     * @param {boolean} [get_metadata] - set to true to request Metadata. Defaults to false
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    get: <T = ParamNode>(param_path?: ParamPath<Tree>, config?: getConfig) => Promise<T>;

    /**
     * Async http PUT method. Modify the data in the param tree at the provided path
     * It is worth noting that this method does NOT automatically merge the response into the Endpoint.Data object.
     * @param {ParamNode} data - The data, with a key, that you wish to PUT to the Param Tree
     * @param {ParamPath<Tree>} param_path - the path you want to PUT to. Defaults to an empty string for a top level PUT
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    put: <T extends ParamNode>(data: T, param_path?: ParamPath<Tree>) => Promise<T>;

    /**
     * Async http POST method. Not often implemented by Adapters, but potentially used to post data
     * files or some other new data to the adapter
     * @param {ParamNode} data - The data, with a key, that you wish to POST to the adapter
     * @param param_path  - the path you want to POST to. defaults to an empty string, for a top level POST
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    post: (data: ParamNode, param_path?: ParamPath<Tree>) => Promise<ParamNode>;

    /**
     * Async http DELETE method. Not often implemented by adapters, but potentially used to remove
     * some part of a mutable Parameter Tree.
     * @param param_path the path to the data you want to DELETE. Defaults to an empty string
     * @returns An Async promise, that when resolved will return the data within the HTTP response
     */
    delete: (param_path?: ParamPath<Tree>) => Promise<ParamNode>;

}

/** Defines allowed values for parameter primitives. */
type Parameter = string | number | boolean | null | undefined;

/** Dict structure for the Parameters. */
type ParamNode = { [property: string]: ParamTree };

/** Any possible value from the Param Tree (Basically any possible JSON value)
 * This could be a primitive value, a dict structure, or an array of any of these values.
 * This flexibility allows for the recursive nested structure of the Parameter Tree
*/
type ParamTree = Parameter | ParamTree[] | ParamNode;


type ParamNum = "int" | "float" | "complex" | "bool"
type ParamList = "list" | "tuple" | "range"
/**Possible Type values from Python */
type ParamType = ParamNum | ParamList | "str" | "NoneType" | "dict"

/** Structure of the Metadata for a single Parameter */
interface MetadataValue<T extends ParamTree = ParamTree> extends ParamNode {
    value: T;
    /**Python Type of the Parameter */
    type: ParamType;
    /**Is the Parameter editable */
    writeable: boolean;
    /**Minimum value for the Parameter (if a number type) */
    min?: number;
    /**Maximum value for the Parameter (if a number type) */
    max?: number;
    /**Array of permitted values for the Parameter*/
    allowed_values?: T[];
    /**Human readable name of the Parameter*/
    name?: string;
    /**Description of what the Parameter represents*/
    description?: string;
    /**What units the Parameter is in (such as cm, degrees C, etc)*/
    units?: string;
    /**Display precision for float/integer Parameters*/
    display_precision?: string;

}

/** Structure for the full Metadata Tree of an Adapter */
type Metadata<T = ParamNode> = {
    [Property in keyof T]:
    T[Property] extends ParamNode ?
    Metadata<T[Property]> :
    T[Property] extends Parameter ?
    MetadataValue<T[Property]> :
    T[Property] // ????
}

/** Type to translate a ParamNode struct into possible paths
 * does not work if the tree T has a generic [key: string]: unknown structure
 * because then it just infers down to string
 */
type ParamPath<T> = {
    // for each key in T
    [Key in keyof T & string]:
    // if T[Key] is also an object that has key/value pairs
    T[Key] extends { [key: string]: unknown } ?
    // add "key/..." keys to possible paths, with ... as recursed ParamPath
    Key | `${Key}/${ParamPath<T[Key]>}` :
    // add just the key
    Key
}[keyof T & (string)]

interface getConfig {
    wants_metadata?: boolean;
    responseType?: AxiosRequestConfig['responseType'];
}

export type { AdapterEndpoint, Metadata, MetadataValue, Parameter, ParamNode, ParamTree, getConfig, ParamPath };