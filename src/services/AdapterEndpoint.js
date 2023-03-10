import React, { useState, useEffect, useCallback } from 'react';
import axios from "axios";

const DEF_API_VERSION = '0.1';

export const useAdapterEndpoint = (
    adapter, endpoint_url, interval=null, api_version='0.1',
) => {

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const base_url = `${endpoint_url ? endpoint_url : ""}/api/${api_version}/${adapter}`;

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
        let result = null;
        try {
            setLoading(true);
            const response = await axios.get(url);
            result = response.data;
        }
        catch (err) {
            handleError(err);
        }
        finally {
            setLoading(false);
        }

        return result;
    }, [base_url, handleError]);

    const put = useCallback(async (data, path='') => {
        const url = `${base_url}/${path}`;
        let result = null;
        try {
            setLoading(true);
            const response = await axios.put(url, data);
            result = response.data;
        }
        catch (err) {
            handleError(err);
        }
        finally {
            setLoading(false);
        }

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
    return { data, error, loading, get, put, refreshData };

}