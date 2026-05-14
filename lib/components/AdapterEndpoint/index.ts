import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/react-query";
import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { useState } from "react";
import { useError } from "../OdinErrorContext";
import type { AdapterEndpoint, getConfig, Metadata, MetadataValue, Parameter, ParamNode, ParamTree } from "./AdapterEndpoint.types";

const isParamNode = (x: ParamTree): x is ParamNode => {
    return x !== null && typeof x === "object" && !Array.isArray(x);
}

const isMetadataValue = (x: Metadata): x is MetadataValue => {
    return isParamNode(x) && "writeable" in x
}

const smartPathSplit = (path: string) => {
    return path.split("/").filter(Boolean);
}

const smartPathJoin = (path: string[]) => {
    return path.filter(Boolean).join("/");
}

/**
 * Navigates down a nested dict-like structure to get the value at the path
 * @param data the nested JSON dict-like structure to navigate down
 * @param path the path, separated by slashes, to navigate down
 * @returns the value at the specified path (which is either a single value, or a JSON Node with Key/Val pair(s))
 * or Undefined if the value was not found at that path
 */
function getValueFromPath<T = Parameter>(data: ParamTree, path: string): T | undefined {
    const splitPath = path.split("/");
    if(splitPath[0]){
        splitPath.forEach((pathPart) => {
            if(isParamNode(data)){
                data = data[pathPart];
            }
        });
    }
    if(data != null){
        return data as T;
    }else{
        return undefined;
    }
}

/**
 * Custom hook that returns functions and access to data from an
 * Odin Control Adapter. Provides access to a local copy of the data and 
 * metadata from the specified adapter.
 * @param adapter Name of the Adapter on the Odin Control instance to communicate with
 * @param endpoint_url The URL of the Odin Control instance. If the GUI is served
 * statically by Odin Control, this can be an empty string.
 * @param interval An optional polling loop interval, in ms
 * @param timeout An option Timeout for API requests, in ms.
 * @returns 
 */
function useAdapterEndpoint<Tree extends Record<string, ParamTree> = ParamNode>(
    adapter: string, endpoint_url: string, interval?: number, timeout?: number
): AdapterEndpoint<Tree> {

    const client = useQueryClient();
    const errCtx = useError();

    const [apiVersion, setApiVersion] = useState<"" | "0.1">("");
    const base_url = smartPathJoin([endpoint_url, "api", apiVersion]);
    const queryKey = [endpoint_url, ...smartPathSplit(adapter)];

    const axiosInstance = axios.create({
        baseURL: base_url,
        timeout: timeout,
        headers: {
            "Content-Type": "application/json"
        }
    })

    const handleError = (err: unknown) => {
        let errorMsg: string = "";
        if (axios.isAxiosError(err)) {
            if (err.code == "ERR_CANCELED") {
                // request was cancelled. Does not need to be reported
                return null;
            }
            const addr = err.config?.url ?? "";
            if (err.response) {
                const method = err.response.config.method ? err.response.config.method.toUpperCase() : "UNDEFINED";
                const reason = err.response.data?.error || "";
                // const address = err.response
                errorMsg = `${method} request to addr ${addr} failed with status ${err.response.status} : ${reason}`;
            }
            else if (err.request) {
                errorMsg = `Network error sending request to ${addr}: ${err.message}`;
            }
        }
        else {
            errorMsg = `Unknown error sending request to ${base_url}`;
        }
        const error = new Error(errorMsg);
        errCtx.setError(error);

        return error;  // return error so it can be caught/thrown
    }

    const queryGet = async <DataType = Tree>({ queryKey, signal }: QueryFunctionContext<[ResponseType | "metadata", ...string[]]>) => {
        const [wants_metadata, addr, ...path] = queryKey;
        const adapter = smartPathJoin(path);
        console.debug(`Query GET, addr "${addr}", adapter path "${adapter}"`);

        const responseType = wants_metadata === "metadata" ? "json" : wants_metadata;
        const request_config: AxiosRequestConfig = { signal: signal, responseType: responseType }
        if (wants_metadata === "metadata") {
            request_config.headers = { Accept: "application/json;metadata=true" };
        }

        try {
            const response = await axiosInstance.get<DataType>(adapter, request_config);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.code == "ERR_NETWORK") {
                console.warn(`Network Error for ${err.config?.baseURL}/${err.config?.url}`);
                // Network error. could be caused by the wrong API type (Odin 1.6.* vs 2.*)
                // try adding/removing the 0.1 from the URL and try again
                const version = apiVersion ? "" : "0.1";
                setApiVersion(version);

                try {
                    const response = await axiosInstance.get<DataType>(smartPathJoin([version, adapter]), request_config);
                    return response.data;
                } catch (err) {
                    console.warn("Retry Failed");

                    throw handleError(err);
                }

            } else {
                throw handleError(err);
            }
        }
    }

    const mutateFunc = async ({ path = "", data, method = "PUT" }: { path?: string, data: ParamNode, method?: "PUT" | "POST" | "DELETE" }) => {
        const request_path = smartPathJoin([adapter, path]);
        let response: AxiosResponse<typeof data>;
        switch(method) {
            case "POST":
                response = await axiosInstance.post(request_path, data);
                break;
            case "DELETE":
                response = await axiosInstance.delete(request_path);
                break;
            case "PUT":
            default:
                response = await axiosInstance.put<typeof data>(request_path, data);
                break;
        }
        return response.data;
    }

    const query = useQuery({
        queryKey: ["json", ...queryKey],
        queryFn: queryGet<Tree>,
        staleTime: interval || Infinity,
        refetchInterval: interval
    });

    const { data: metadata } = useQuery({
        queryKey: ["metadata", ...queryKey],
        queryFn: queryGet<Metadata<Tree>>,
        staleTime: Infinity
    });

    const mutation = useMutation({
        mutationKey: queryKey,
        mutationFn: mutateFunc
    });

    const get = async <T = ParamNode>(param_path = "", config?: getConfig) => {
        console.debug(`GET: ${base_url}/${param_path}`);

        const { wants_metadata = false, responseType = 'json' } = config ?? {};
        const key: [ResponseType | "metadata", ...string[]] = [
            wants_metadata ? "metadata" : responseType,
            endpoint_url,
            ...smartPathSplit(adapter),
            ...smartPathSplit(param_path)
        ]
        const data = await client.fetchQuery({ queryKey: key, queryFn: queryGet<T> });
        return data;
    }

    const put = async <T extends ParamNode>(data: T, param_path?: string) => {
        console.debug(`PUT: ${base_url}/${param_path}, data: `, data);
        try {
            return await mutation.mutateAsync(
                { path: param_path, data: data },
                { onSuccess: async () => { await client.invalidateQueries({ queryKey: ["json", ...queryKey] }) } }
            ) as T;
        } catch (err) {
            throw handleError(err);
        }
    }

    const post = async <T extends ParamNode>(data: T, param_path?: string) => {
        console.debug(`POST: ${base_url}/${param_path}, data:`, data);
        try {
            return await mutation.mutateAsync(
                {path: param_path, data: data, method: "POST"},
                { onSuccess: async () => { await client.invalidateQueries({ queryKey: ["json", ...queryKey] }) } }
            ) as T;
        } catch (err) {
            throw handleError(err);
        }
    }

    const remove = async (param_path?: string) => {
        console.debug(`DELETE: ${base_url}/${param_path}`);

        try {
            return await mutation.mutateAsync(
                {path: param_path, method: "DELETE", data: {}},
                { onSuccess: async () => { await client.invalidateQueries({ queryKey: ["json", ...queryKey] }) } }
            )
        } catch (err) { 
            throw handleError(err);
        }
    }

    return {
        data: query.data as Tree,
        metadata: metadata as Metadata<Tree>,
        loading: mutation.isPending,
        get, put, post, delete: remove, apiVersion
    }
}

export { getValueFromPath, isMetadataValue, isParamNode, useAdapterEndpoint };
export type { AdapterEndpoint, Metadata, Parameter, ParamNode, ParamTree };
