import React, { useEffect, useState, useContext } from "react";

import AdapterEndpoint from "../odin_control";
import usePeriodicFetch from "./usePeriodicFetch";

const OdinContext = React.createContext(null);

export function OdinProvider(props){
    
    const [contextValue, setContextValue] = useState({});
    useEffect(() => {
        
        var adapterEndpoints = {}
        props.endpoints.map(endpoint =>
            (adapterEndpoints[endpoint] = new AdapterEndpoint(endpoint, process.env.REACT_APP_ENDPOINT_URL))
        );
    
        console.log("endpoints:");
        console.log(adapterEndpoints);
        // const periodicFetches = props.endpoints.map(endpointName => {
        //     const endpoint = adapterEndpoints[endpointName];
        //     console.log(endpoint);
        //     return {[endpointName]: usePeriodicFetch("", endpoint)};
        // });
        // console.log("Fetches:");
        // console.log(periodicFetches);
        setContextValue(
            adapterEndpoints,
            // periodicFetches
        );
    }, [props]);

    
    
    return (<OdinContext.Provider value={contextValue}>
        {props.children}
    </OdinContext.Provider>)
}

export function useOdinContext() {
    const context = useContext(OdinContext);
    return context;
}