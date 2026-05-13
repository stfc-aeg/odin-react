import { useMutation, useQuery, useQueryClient, type QueryFunctionContext } from "@tanstack/react-query";
import type { Metadata, ParamTree, AdapterEndpoint, ParamNode, getConfig } from "./AdapterEndpoint.types";
import { useError } from "../OdinErrorContext";
import axios, { AxiosRequestConfig, ResponseType } from "axios";
import { useState } from "react";

const smartPathSplit = (path: string) => {
    return path.split("/").filter(Boolean);
}

const smartPathJoin = (path: string[]) => {
    return path.filter(Boolean).join("/");
}

function useAdapterEndpoint<Tree extends Record<string, ParamTree> = ParamNode>(
    adapter: string, endpoint_url: string, interval?: number, timeout?: number
): AdapterEndpoint<Tree> {

    const client = useQueryClient();
    const errCtx = useError();

    const [apiVersion, setApiVersion] = useState<"" | "0.1">("");
    //TODO: this does not check for Odin Control Version (needing "0.1" or not)
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

    const queryPut = async ({ path = "", data }: { path?: string, data: ParamNode }) => {
        const request_path = smartPathJoin([adapter, path]);
        const response = await axiosInstance.put<typeof data>(request_path, data);
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
        mutationFn: queryPut
    });

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

    return {
        data: query.data as Tree,
        metadata: metadata as Metadata<Tree>,
        loading: mutation.isPending,
        get, put, apiVersion
    }
}

export { useAdapterEndpoint }