import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import path from "path";

const DEF_API_VERSION = '0.1';

type ErrorState = null | Error;
type LoadingState = "getting" | "putting" | "idle";

type response_record = string | number | null | boolean  // typedef for param tree leaf nodes

// NResponse is the Nested Repsonse type for the Param Tree. Each node can either be a repsonse_record (leaf)
// or another NResponse Object
export type NResponse = {[key: string]: response_record | response_record[] | NResponse}

// Type check guard method required for MergeData below
const isNResponse = (x: any): x is NResponse => typeof x === 'object'

export interface AdapterEndpoint_t {
    data: object;
    error: ErrorState;
    loading: LoadingState;
    get: (param_path?: string, get_metadata?: boolean) => Promise<NResponse>;
    put: (data: Object, param_path?: string) => Promise<NResponse>;
    refreshData: () => void;
    mergeData: (newData: NResponse, param_path: String) => void;

}

export const useAdapterEndpoint = (
    adapter: string, endpoint_url: string, interval: number | null = null, api_version=DEF_API_VERSION,
): AdapterEndpoint_t => {
    const [data, setData] = useState<NResponse>({});
    const [error, setError] = useState<ErrorState>(null);
    const [loading, setLoading] = useState<LoadingState>("idle");

    const dataRef = useRef(data);
    dataRef.current = data;

    const base_url = `${endpoint_url ? endpoint_url : ""}/api/${api_version}/${adapter}`;

    //** handles errors thrown by the http requests, setting it in the Error State*/
    const handleError = useCallback((err: unknown) => {
        let errorMsg: string = "";
        if(axios.isAxiosError(err)){
            if(err.response) {
                const method = err.response?.config?.method ? err.response.config.method.toUpperCase() : "UNDEFINED";
                errorMsg = `${method} request failed with status ${err.response.status} : `;
                errorMsg = errorMsg + err.response.data?.error || "";
            }
            else if (err.request) {
                errorMsg = `Network error sending request to ${base_url}`;
            }
        }
        else {
            errorMsg = `Unknown error sending request to ${base_url}`;
        }
        setError(new Error(errorMsg));
    }, [base_url, setError]);

    const get = useCallback(async (param_path='', get_metadata=false) => {
        const url = path.join(base_url, param_path);
        console.log("GET: " + url);

        let result: NResponse = {};
        let response: AxiosResponse;

        try {
            setLoading("getting");
            if(get_metadata) {
                response = await axios.get(url, {
                    headers: {
                        "Accept": "application/json;metadata=true"
                    }
                })
            }else {
                response = await axios.get(url);
            }
            result = response.data;
        }
        catch (err) {
            handleError(err);
        }
        finally {
            setLoading("idle")
        }
        console.log("Response: ", result);
        return result;
    }, [base_url, handleError]);

    const put = useCallback(async (data: Object, param_path='') => {
        const url = path.join(base_url, param_path);
        console.log("PUT: " + url + ", data: " + data);
        
        let result: NResponse = {};
        let response: AxiosResponse;

        try {
            setLoading("putting");
            response = await axios.put(url, data);
            result = response.data;
        }
        catch (err) {
            handleError(err);
        }
        finally {
            setLoading("idle");
        }
        console.log("Response: ", result);
        return result;

    }, [base_url, setError]);

    useEffect(() => {
        let timer_id: NodeJS.Timeout | null = null;
        if(interval) {
            timer_id = setInterval(refreshData, interval);
        }
        else{
            refreshData();
        }

        return () => {
            if(timer_id){
                clearInterval(timer_id);
            }
        }
    })

    const refreshData = () => {
        get("")
        .then(result => {
            setData(result);
        });
    }
    
    const mergeData = (newData: NResponse, param_path: String) => {
        let splitPath = param_path.split("/");
        var tmpData: NResponse | response_record | response_record[] = dataRef.current;

        if(splitPath[0]) {
            splitPath.forEach((part_path, index) => {
                if(index < splitPath.length - 1){
                    if(isNResponse(tmpData)){
                        tmpData = tmpData[part_path as keyof typeof tmpData];
                    }
                }
            })
        }
        // let key: keyof Object;
        for(let key in newData)
        {
            const value = newData[key];

            tmpData[key] = value;
        }
    }
    
    return { data: dataRef.current, error, loading, get, put, refreshData, mergeData}
}