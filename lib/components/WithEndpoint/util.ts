import type { AdapterEndpoint, ParamTree } from "../AdapterEndpoint";
import { isParamNode } from "../AdapterEndpoint";


export interface EndpointProps<PreArgs extends unknown[], PostArgs extends unknown[]> {
    endpoint: AdapterEndpoint;
    fullpath: string;
    value?: ParamTree;
    min?: number;
    max?: number;
    disabled?: boolean;
    pre_method?: (...args: PreArgs) => void;
    post_method?: (...args: PostArgs) => void;
    pre_args?: PreArgs;
    post_args?: PostArgs;
}

const getLastPathPart = (path: string): [string, string] => {
    const splitPath = path.replace(/\/$/, "").split("/");
    const name = splitPath.pop() ?? "";

    return [name, splitPath.join("/")];

}

/**
 * Handles PUT requests for WithEndpoint components. Checks versioning of Odin Control
 * to ensure proper PUT data layout (Odin Control 2.0 can accept PUTs of {"value": val})
 * to avoid returning more of the tree than required.
 * @param val Value to PUT to the adapter.
 * @param endpoint AdapterEndpoint to handle the PUT request
 * @param path Path to the parameter
 */
export async function sendRequest<T extends ParamTree>(val: T, endpoint: AdapterEndpoint, path: string): Promise<void> {

    const [sendVal, sendPath] = (function() {
        if(isParamNode(val)){
            return [val, path]
        }
        else if(endpoint.apiVersion){
            const [name, splitPath] = getLastPathPart(path);
            return [{[name]: val}, splitPath];
        }
        else {
            return [{value: val}, path];
        }
    })();
    try{
        const response = await endpoint.put(sendVal, sendPath);
        endpoint.mergeData(response, sendPath);
    }catch (err){
        console.debug("Error in PUT occured in WithEndpoint component", err);
    }
}

