import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosResponse } from "axios";
import path from "path";

const DEF_API_VERSION = '0.1';

type ErrorState = null | Error;
type LoadingState = "getting" | "putting" | "idle";

export const useAdapterEndpoint = (
    adapter: string, endpoint_url: string, interval: number | null = null, api_version=DEF_API_VERSION,
) => {
    const [data, setData] = useState({});
    const [error, setError] = useState<ErrorState>(null);
    const [loading, setLoading] = useState<LoadingState>("idle");

    const dataRef = useRef(data);
    dataRef.current = data;

    const base_url = `${endpoint_url ? endpoint_url : ""}/api/${api_version}/${adapter}`;

    const handleError = useCallback((err) => {
        let errorMsg: string;

        if(err.response) {
            const method = err.response.config.method.toUpperCase();
            errorMsg = `${method} request failed with status ${err.response.status} : `;
            errorMsg = errorMsg + err.response.data?.error || "";
        }
        else if (err.request) {
            errorMsg = `Network error sending request to ${base_url}`;
        }
        else {
            errorMsg = `Unknown error sending request to ${base_url}`;
        }
        setError(new Error(errorMsg));
    }, [base_url, setError]);

    const get = useCallback(async (param_path='', get_metadata=false) => {
        const url = path.join(base_url, param_path);
        console.log("GET: " + url);

        let result: Object = {};
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
        
        let result: Object = {};

        try {
            setLoading("putting");
            const response = await axios.put(url, data);
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

    const refreshData = () => {
        get("")
        .then(result => {
            setData(result);
        });
    }
    
    const mergeData = (newData: Record<string, string | number | Record<string, any> | Array<any>>, param_path: String) => {
        let splitPath = param_path.split("/");
        var tmpData: Record<string, any> = dataRef.current;

        if(splitPath[0]) {
            splitPath.forEach((part_path, index) => {
                if(index < splitPath.length - 1){
                    tmpData = tmpData[part_path as keyof typeof tmpData];
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