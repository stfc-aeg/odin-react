import { useMemo, useTransition } from "react";
import type { AdapterEndpoint, ParamTree, ParamNode } from "../AdapterEndpoint";
import { getValueFromPath, isMetadataValue, isParamNode } from "../AdapterEndpoint";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { useError } from "../OdinErrorContext";

import type { ArgType, EndpointProps } from "./utils.types";

interface RequestHandler {
    requestHandler: (val?: ParamTree) => void;
    data: ParamTree;
    disable: boolean;

}

type dataTypes = "string" | "number" | "boolean" | "null" | "list" | "dict"

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
async function sendRequest<T extends ParamTree>(val: T, endpoint: AdapterEndpoint, path: string): Promise<ParamNode> {

    const [sendVal, sendPath] = (function () {
        if (isParamNode(val)) {
            return [val, path]
        }
        else if (endpoint.apiVersion) {
            const [name, splitPath] = getLastPathPart(path);
            return [{ [name]: val }, splitPath];
        }
        else {
            return [{ value: val }, path];
        }
    })();
    try {
        const response = await endpoint.put(sendVal, sendPath);
        endpoint.mergeData(response, sendPath);
        return response;
    } catch (err) {
        console.debug("Error in PUT occurred in WithEndpoint component", err);
        return {"error": "PUT Failed"}
    }
}

function useRequestHandler<PreArgs extends ArgType, PostArgs extends ArgType>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args }: EndpointProps<PreArgs, PostArgs>
): RequestHandler {

    const [isPending, startTransition] = useTransition();
    const { setError } = useError();
    const data: ParamTree = value ?? getValueFromPath(endpoint.data, fullpath);
    const metadata: MetadataValue = getValueFromPath(endpoint.metadata, fullpath)
        ?? {
        value: data,
        type: typeof data == "number" ? "int" : "str",
        writeable: true
    };

    const disable = disabled || isPending || endpoint.loading || !(metadata.writeable ?? true);

    const type: dataTypes = useMemo(() => {
        if (isMetadataValue(metadata)) {
            switch (metadata.type) {
                case "int":
                case "float":
                case "complex":
                    return "number";
                case "list":
                case "tuple":
                case "range":
                    return "list"
                case "bool":
                    return "boolean"
                case "str":
                    return "string"
                case "NoneType":
                    return "null"
                default:
                    return metadata.type as dataTypes;
            }
        } else {
            const dataType = typeof data;
            switch (dataType) {
                case "bigint":
                case "number":
                    return "number";
                case "object":
                    switch (true) {
                        case data instanceof Array:
                            return "list";
                        case data == null:
                            return "null";
                        default:
                            return "dict";
                    }
                case "boolean":
                case "string":
                    return dataType;
                case "undefined":
                default:
                    console.warn(`Invalid Data type ${typeof data} for path ${fullpath}`)
                    return "null";
            }
        }

    }, [metadata, data]);

    const validate = (val: typeof data) => {
        switch (type) {
            case "number":
                val = Number(val);
                break;
            case "boolean":
                if (typeof val === "string" && val.toLowerCase() === "false") {
                    val = false;
                } else {
                    val = Boolean(val);
                }
                break;
            case "list":
                if (typeof val === "string") {
                    val = val.split(",");
                }
                break;
            case "string":
                val = String(val);
                break;
            case "null":
                val = val ?? true;
        }

        if (isMetadataValue(metadata)) {
            if (metadata.allowed_values && !(metadata.allowed_values.includes(val))) {
                throw Error(`Value ${val} not in allowed_values list: [${metadata.allowed_values.join(", ")}]`);
            }
            if (typeof val === "number") {
                if (metadata.min != undefined && metadata.min > val) {
                    throw Error(`Value ${val} below minimum ${metadata.min}`);
                }
                if (metadata.max != undefined && metadata.max < val) {
                    throw Error(`Value ${val} above maximum ${metadata.max}`);
                }
            }
        }

        return val;
    }



    const requestHandler: RequestHandler["requestHandler"] = (val) => {
        try {
            val = validate(val);
            startTransition(async () => {
                // check if pre_args has the value key, but has set it to undefined
                // ideally, we'd have a way to check that the PreArgs type has "value"
                // as a key and see that the pre_args object doesn't include it,
                // but I need to find a way to make the PreArgs type accessible
                // at runtime to do that
                if(pre_args && Object.keys(pre_args).includes("value")) {
                    if (pre_args.value == undefined || pre_args.value == null) {
                        // if so, overwrite the value with the param to be put
                        pre_args.value = val;
                    }
                }
                const modVal = pre_method?.(pre_args as PreArgs);

                sendRequest(modVal ?? val ?? data, endpoint, fullpath)
                    .then((value) => {
                        
                        if(post_args && Object.keys(post_args).includes("value")) {
                            if(post_args.value == undefined || post_args.value == null) {
                                // depending on Odin Control version, and how
                                // many Params we are PUTing, the returned response from sendRequest
                                // can be of of these shapes:
                                //   {value: param}  - single param, Odin 2.0
                                //   {[param_name: param]} - single param, Odin 1.6
                                //   {[param_name]: {param_1: x, param_2: y...}} - multiple param, Odin 1.6
                                //   {param_1: x, param_2: y...} - multiple param, Odin 2.0
                                if(Object.keys(value).length == 1){
                                    // either Odin 1.6 with any number params, or 2.0 with single
                                    post_args.value = value[Object.keys(value)[0]]
                                } else {
                                    // Odin 2.0, multiple params. Set full dict as value
                                    post_args.value = value;
                                }
                            }
                        }
                        post_method?.(post_args as PostArgs);
                    });
            })
        } catch (err) {
            setError(err instanceof Error ? err : Error("Unknown Error Occurred"));
        }
    }

    return { requestHandler, data, disable }

}

export { sendRequest, useRequestHandler };
export type { EndpointProps, ArgType};
