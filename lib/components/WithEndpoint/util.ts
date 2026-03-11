import { useTransition } from "react";
import type { AdapterEndpoint, ParamTree } from "../AdapterEndpoint";
import { getValueFromPath, isParamNode } from "../AdapterEndpoint";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";


export interface EndpointProps<PreArgs extends unknown[], PostArgs extends unknown[]> {
    endpoint: AdapterEndpoint;
    fullpath: string;
    value?: ParamTree;
    disabled?: boolean;
    pre_method?: (...args: PreArgs) => void;
    post_method?: (...args: PostArgs) => void;
    pre_args?: PreArgs;
    post_args?: PostArgs;
}

interface RequestHandler {
    requestHandler: (val?: ParamTree) => void;
    data: ParamTree;
    disable: boolean;

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

export function useRequestHandler<PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args } : EndpointProps<PreArgs, PostArgs>
): RequestHandler {

    const [isPending, startTransition] = useTransition();

    const data: ParamTree = value ?? getValueFromPath(endpoint.data, fullpath);
    const metadata: MetadataValue = getValueFromPath<MetadataValue>(endpoint.metadata, fullpath)
                                        ?? {value: data,
                                            type: typeof data == "number" ? "int" : "str",
                                            writeable: true};

    const disable = disabled || isPending || endpoint.loading || !(metadata.writeable ?? true);

    const requestHandler: RequestHandler["requestHandler"] = (val) => {
        startTransition(async () => {

            pre_method?.(...(pre_args ?? []) as PreArgs);

            sendRequest(val ?? data, endpoint, fullpath)
            .then(() => {
                post_method?.(...(post_args ?? []) as PostArgs);
            });
        })
    }

    return {requestHandler, data, disable}

}

