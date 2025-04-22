import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import { LoadingState, ErrorState, AdapterEndpoint_t, paramNode, paramLeaf } from "../../types";
import { isParamNode } from "../../types";

const DEF_API_VERSION = '0.1';

export const useAdapterEndpoint = (
    adapter: string, endpoint_url: string, interval: number | null = null, api_version=DEF_API_VERSION,
): AdapterEndpoint_t => {
    const [data, setData] = useState<paramNode>({});
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
        const url = [base_url, param_path].join("/") // assumes param_path does not start with a slash
        console.log("GET: " + url);

        let result: paramNode = {};
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
        const url = [base_url, param_path].join("/"); // assumes param_path does not start with a slash
        console.log("PUT: " + url + ", data: ", data);
        
        let result: paramNode = {};
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

    }, [base_url, handleError]);

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
    }, [base_url, interval, get]);

    const refreshData = () => {
        get("")
        .then(result => {
            setData(result);
        });
    }
    
    const mergeData = (newData: paramNode, param_path: String) => {
        let splitPath = param_path.split("/");
        var tmpData: paramNode | paramLeaf | paramLeaf[] = dataRef.current;

        if(splitPath[0]) {
            splitPath.forEach((part_path, index) => {
                if(index < splitPath.length - 1){
                    if(isParamNode(tmpData)){
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