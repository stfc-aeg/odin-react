import { useState, useEffect } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ErrorState, AdapterEndpoint_t, JSON, NodeJSON, getConfig } from "../../helpers/types";
import { isParamNode } from "../../helpers/types";
import { useError } from "../OdinErrorContext";

const DEF_API_VERSION = '0.1';

export function useAdapterEndpoint<T extends NodeJSON = NodeJSON>(
    adapter: string, endpoint_url: string, interval?: number, timeout?: number, api_version=DEF_API_VERSION
): AdapterEndpoint_t<T> {

    const [data, setData] = useState<T>({} as T);
    const [metadata, setMetadata] = useState<NodeJSON>({});
    const [error, setError] = useState<ErrorState>(null);
    const [updateFlag, setUpdateFlag] = useState<symbol>(Symbol("init"));

    const [awaiting, changeAwaiting] = useState(false);

    const ctx = useError();

    const base_url = `${endpoint_url ? endpoint_url : ""}/api/${api_version}/${adapter}`;
    const axiosInstance: AxiosInstance = axios.create({
        baseURL: base_url,
        timeout: timeout,
        headers: {
            "Content-Type": "application/json",
            // "Accept": "application/json,image/*"
        }
    })

    //** handles errors thrown by the http requests, setting it in the Error State*/
    const handleError = (err: unknown) => {
        let errorMsg: string = "";
        if(axios.isAxiosError(err)){
            if(err.response) {
                const method = err.response.config.method ? err.response.config.method.toUpperCase() : "UNDEFINED";
                const reason = err.response.data?.error || "";
                errorMsg = `${method} request failed with status ${err.response.status} : ${reason}`;
            }
            else if (err.request) {
                errorMsg = `Network error sending request to ${base_url}: ${err.message}`;
            }
        }
        else {
            errorMsg = `Unknown error sending request to ${base_url}`;
        }
        const error = new Error(errorMsg);
        setError(error);
        ctx.setError(error);

        return error;  // rethrow error so it doesn't dissapear
    };

    const get = async <T = NodeJSON>(param_path='', config?: getConfig) => {
        console.debug(`GET: ${base_url}/${param_path}`);

        const {wants_metadata=false, responseType='json'} = config ?? {};

        let result: T;
        let response: AxiosResponse<T>;

        const request_config: AxiosRequestConfig = {responseType: responseType};
        if(wants_metadata){
            request_config.headers = {Accept: "application/json;metadata=true"};
        }
        
        try {
            //intentionally not setting the awaiting state here to avoid
            //issues with the WithEndpoint component
            response = await axiosInstance.get<T>(param_path, request_config);
            result = response.data;
            console.debug("Response Data: ", result);
            return result;
        }
        catch (err) {
            throw handleError(err);
        }
    };

    const put = async (data: NodeJSON, param_path='') => {
        // const url = [base_url, param_path].join("/"); // assumes param_path does not start with a slash
        console.debug(`PUT: ${base_url}/${param_path}, data: `, data);
        
        let result: NodeJSON = {};
        let response: AxiosResponse<typeof result>;

        try {
            changeAwaiting(true);
            response = await axiosInstance.put(param_path, data);
            result = response.data;
            
            console.debug("Response: ", result);
            return result;
        }
        catch (err: unknown) {
            throw handleError(err);
        }
        finally {
            changeAwaiting(false);
        }
    };

    const post = async (data: NodeJSON, param_path="") => {
        console.debug(`POST: ${base_url}/${param_path}, data: `, data);

        let result: NodeJSON = {};
        let response: AxiosResponse<typeof result>;

        try {
            changeAwaiting(true);
            response = await axiosInstance.post(param_path, data);
            result = response.data;
        }
        catch (err: unknown) {
            handleError(err);
        }
        finally {
            changeAwaiting(false);
        }
        console.debug("Response: ", result);
        
        return result;
    };

    const remove = async (param_path="") => {
        console.debug(`DELETE: ${base_url}/${param_path}`);

        let result: NodeJSON = {};
        let response: AxiosResponse<typeof result>;

        try {
            changeAwaiting(true);
            response = await axiosInstance.delete(param_path);
            result = response.data;
        }
        catch (err: unknown) {
            handleError(err);
        }
        finally {
            changeAwaiting(false);
        }
        console.debug("Response: ", result);
        
        return result;
    }

    useEffect(() => {
        //run when the endpoint is first created, to populate its data and metadata objects
        refreshData();

        //get metadata
        get("", {wants_metadata: true})
        .then(result => {
            setMetadata(result);
        })
    }, []); // no dependencies, intentionally so that it runs only at the start when the component mounts

    useEffect(() => { // interval effect. refreshes data if the interval is set
        let timer_id: NodeJS.Timeout | null = null;
        if(interval) {
            timer_id = setInterval(refreshData, interval);
        }

        return () => {
            if(timer_id){
                clearInterval(timer_id);
            }
        }
    }, [interval]);

    const refreshData = () => {
        get("")
        .then(result => {
            setData(result as T);
            setUpdateFlag(Symbol("refreshed"));
        });
    }
    
    const mergeData = (newData: NodeJSON, param_path: string) => {
        const splitPath = param_path.split("/").slice(0, -1);
        const tmpData = data;  // use tmpData as a copy of the Data that we can modify
        let pointer: JSON = tmpData;  // pointer that can traverse down the nested data

        if(splitPath[0]) {
            splitPath.forEach((part_path) => {
                if(isParamNode(pointer)){
                    pointer = pointer[part_path];
                }
            });
        }
        // becasue pointer was a copy of tmpData, changes made to it will also be made to tmpData
        Object.assign(pointer, newData);
        setData(tmpData);
        setUpdateFlag(Symbol("merged"));
    }
    
    return { data: data, metadata, error, loading: awaiting, updateFlag, get, put, post, remove, refreshData, mergeData}
}