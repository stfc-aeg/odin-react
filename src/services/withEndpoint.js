
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

function WithEndpoint(WrappedComponent)
{
    const withEndpointComponent = (props) => {
        const {endpoint, fullpath, value, event_type, disabled, ...leftover_props} = props;

        const data = useRef(value);
        const timer = useRef(null);

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
                .catch((err) => {
                    setError(err)
                })
            }
            else{
                console.log("Setting Default Value");
                setDefaultValue(value);
            }
        }, []) // set to have no dependencies, so only runs when the component first mounts
        
        const disable = useMemo(() => {
            //TODO: this is here so we can more smartly disable/enable inputs in the future
            if(disabled !== undefined){
                return disabled
            }else{
                return endpoint.loading === "putting"
            }
        }, [endpoint.loading, disabled])

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
            setTimer(val);
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
            console.log(isNaN(eventKey));
            let val = isNaN(eventKey) ? eventKey : Number(eventKey);


            sendRequest(val);
        }

        const sendRequest = useCallback((val) => {
            clearInterval(timer.current);
            const sendVal = {[valueName]: val};
            endpoint.put(sendVal, path)
                .then((response) => { // some sort of refresh of the endpoints data dict
                    endpoint.mergeData(response, path)
                }) 
                .catch((err) => {
                    setError(err);
                });
        }, [endpoint]);

        const setTimer = useCallback((val) => {
            if(timer.current){
                clearInterval(timer.current);
            }
            // send data after a delay of a second
            timer.current = setInterval(() => {console.log("Timer Elapsed. Sending Data"); sendRequest(val)}, 1000);
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
        }, [event_type, value]);

        return (<WrappedComponent {...eventProp} {...leftover_props} ref={data} defaultValue={defaultValue} disabled={disable}/>);


    };

    return withEndpointComponent;
}

export default WithEndpoint;