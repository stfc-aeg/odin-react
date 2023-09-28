import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from "axios";

const DEF_API_VERSION = '0.1';

export const useAdapterEndpoint = (
    adapter, endpoint_url, interval=null, api_version='0.1',
) => {

    const [data, setData] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState("idle");

    const dataRef = useRef(data);
    
    const base_url = `${endpoint_url ? endpoint_url : ""}/api/${api_version}/${adapter}`;
    dataRef.current = data

    const handleError = useCallback((err) => {

        let errorMsg = "";
        if (err.response) {
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

    const get = useCallback(async (path='') => {
        const url = `${base_url}/${path}`;
        console.log("GET: " + url);
        let result = {};
        try {
            setLoading("getting");
            const response = await axios.get(url);
            result = response.data;
        }
        catch (err) {
            handleError(err);
        }
        finally {
            setLoading("idle");
        }

        return result;
    }, [base_url, handleError]);

    const put = useCallback(async (data, path='') => {
        const url = `${base_url}/${path}`;
        console.log("PUT: " + url + " data: ", data);
        let result = null;
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
        console.log("RESPONSE: ", result)
        return result;
    }, [base_url, handleError]);

    useEffect(() => {
        let timer_id = null;
        if (interval) {
            timer_id = setInterval(() => {
                refreshData();
            }, interval);
        }
        else{
            refreshData();
        }
        return () => {
            if (timer_id) {
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

    const mergeData = (newData, path) => {
        let splitPath = path.split("/")
        let tmpData = dataRef.current
        if(splitPath[0]){
            splitPath.forEach((part_path, index) => {
                if(index < splitPath.length-1){  //make sure position in nested dict is the same as response
                    tmpData = tmpData[part_path]
                }
            })
        }
        for(var key in newData)
        {
            // for each value in the response data, add it to the data ref
            tmpData[key] = newData[key]
        }
    };

    

    return { data: dataRef.current, error, loading, get, put, refreshData, mergeData };

}