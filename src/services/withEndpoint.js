
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

function WithEndpoint(WrappedComponent)
{
    const withEndpointComponent = (props) => {
        const {endpoint, fullpath, value, event_type, ...leftover_props} = props;

        const data = useRef(value);

        const [error, setError] = useState(null);
        const [eventProp, setEventProp] = useState(null);

        const [defaultValue, setDefaultValue] = useState(value);

        useEffect(() => {
            if(value == null){
                endpoint.get(fullpath)
                .then((response) => {
                    // console.log(response)
                    setDefaultValue(response[valueName]);
                })
            }
            else{
                console.log("Setting Default Value");
                setDefaultValue(value);
            }
        }, []) // set to have no dependencies, so only runs when the component first mounts

        useEffect(() => {
            console.log("ENDPOINT CHANGED")
            console.log(endpoint)
        }, endpoint.data)

        const {path, valueName} = useMemo(() => {
            let path = "";
            let valueName = fullpath.trim("/");
            if(valueName.includes("/"))
            {
                [path, valueName] = valueName.split(/\/(?!.*\/)(.*)/, 2);
            }
            return {path, valueName};
        }, [fullpath])

        const onChangeHandler = (event) => {
            console.log(event);
            console.log(data.current);
            let val = null;
            if(event?.target?.value != null){
                
                val = isNaN(event.target.value) ? event.target.value : +event.target.value;

            }else{
                val = isNaN(data.current.value) ? data.current.value : +data.current.value;
            }
            sendRequest(val);
        }

        const onClickHandler = (event) => {
            console.log(event)
            let val = null;
            if(data.current?.tagName?.toLowerCase() === "button")
            {
                // special case for buttons
                val = value;
            }
            else if(data.current?.value != null && data.current?.value != undefined){
                console.log("Data current")
                console.log(data.current)
                val = (typeof data.current.value === "number") ? Number(data.current.value) : data.current.value;
            }
            else if(event?.target?.value != null){
                console.log("Target Value")

                val = (typeof event.target.value === "number") ? Number(event.target.value) : event.target.value;
            }
            else{
                val = value;
            }
            sendRequest(val);
        }

        const onSelectHandler = (eventKey, event) => {
            console.log(event);
            console.log(eventKey);
            sendRequest(eventKey);
        }

        const sendRequest = useCallback((val) => {
            const sendVal = {[valueName]: val};
            endpoint.put(sendVal, path)
                .then((response) => { // some sort of refresh of the endpoints data dict
                    endpoint.mergeData(response, path)
                }) 
                .catch((err) => {
                    setError(err);
                });
        }, [endpoint]);

        useMemo(() => {
            switch(event_type){
                case "select":
                    setEventProp({onSelect: (eventKey, event) => onSelectHandler(eventKey, event)});
                break;
                case "click":
                    setEventProp({onClick: event => onClickHandler(event)});
                break;
                case "change":
                default:
                    setEventProp({onChange: event => onChangeHandler(event)});
            }
        }, [event_type]);

        return (<WrappedComponent {...eventProp} {...leftover_props} ref={data} defaultValue={defaultValue}/>);


    };

    return withEndpointComponent;
}

export default WithEndpoint;