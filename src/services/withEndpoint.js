
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

function WithEndpoint(WrappedComponent)
{
    const withEndpointComponent = (props) => {
        const {endpoint, fullpath, value, value_type, event_type, disabled, delay=1000,
               pre_method=null, pre_args=null, post_method=null, post_args=null,
            ...leftover_props} = props;

        const component = useRef(value);
        const timer = useRef(null);
        const metadata = useRef(null);

        const pre_func_kwargs = useRef(pre_args);
        const post_func_kwargs = useRef(post_args);

        const [error, setError] = useState(null);
        const [eventProp, setEventProp] = useState(null);

        const [componentValue, setComponentValue] = useState(value ?? '');


        const endpointValue = useMemo(() => {
            let val = endpoint.data;
            let splitPath = fullpath.split("/");
            try {
                splitPath.forEach((path_part) => {
                    if(path_part)
                    {
                        val = val[path_part];
                    }
                })
                return val;
            }
            catch(err) {
                return "";
            }
        }) //the lack of dependancy array here means this will run every render. 
           //Might cause some performance issues in GUIs with lots of inputs? Unsure.

        useEffect(() => {
            if(value == null){
                endpoint.get(fullpath, true)
                .then((response) => {
                    // check if there is metadata attached. some adapters dont implement it
                    let data = response[valueName];
                    if(typeof data === 'object'){  // are we ever going to recieve an object and it NOT be metadata?
                        let tmp_metadata = {};
                        tmp_metadata['writeable'] = data['writeable'];
                        setComponentValue(data['value']);
                        if("min" in data){
                            tmp_metadata['min'] = data['min'];
                        }
                        if("max" in data){
                            tmp_metadata['max'] = data['max'];
                        }
                        console.log(tmp_metadata);
                        metadata.current = tmp_metadata;


                    }else{
                        console.log("Adapter Has not implemented Metadata");
                        setComponentValue(response[valueName]);
                    }
                })
                .catch((err) => {
                    setError(err)
                })
            }
            else{
                setComponentValue(value);
            }
        }, []) // set to have no dependencies, so only runs when the component first mounts
        
        useEffect(() => {
            console.log("Setting Component Value: %s", fullpath);
            setComponentValue(endpointValue);
        }, [endpointValue]);

        const disable = useMemo(() => {
            //TODO: this is here so we can more smartly disable/enable inputs in the future
            if(disabled !== undefined){
                return ((disabled) || (endpoint.loading === "putting"))
            }else{
                if(metadata.current){
                    return endpoint.loading === "putting" || ! metadata.current.writeable
                }
                return endpoint.loading === "putting"
            }
        }, [endpoint.loading, disabled, metadata.current])

        const {path, valueName} = useMemo(() => {
            let path = "";
            let valueName = fullpath.trim("/");
            if(valueName.includes("/"))
            {
                [path, valueName] = valueName.split(/\/(?!.*\/)(.*)/, 2);
            }
            return {path, valueName};
        }, [fullpath])

        const validate = (value) => {
            let isValid = true;
            console.log(metadata.current);

            if("min" in metadata.current && metadata.current.min > value){
                console.log("Value below min:", value);
                isValid = false;
            }
            if("max" in metadata.current && metadata.current.max < value){
                console.log("Value Higher than Max:", value);
                isValid = false;
            }

            return isValid;
        }

        const onChangeHandler = (event) => {
            console.log(event);
            console.log(component.current);
            let val = null;
            if(event?.target?.value != null){
                
                val = isNaN(event.target.value) || value_type == "text" ? event.target.value : +event.target.value;
                setComponentValue(val);

            }else{
                val = isNaN(component.current.value) || value_type == "text" ? component.current.value : +component.current.value;
                setComponentValue(val);
            }
            setTimer(val);
        }

        const onClickHandler = (event) => {
            console.log(event)
            let val = null;
            if(component.current?.tagName?.toLowerCase() === "button")
            {
                // special case for buttons
                val = value;
            }
            else if(component.current?.value != null && component.current?.value != undefined){
                console.log("Data current")
                console.log(component.current)
                val = (typeof component.current.value === "number") ? Number(component.current.value) : component.current.value;
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
            if(!validate(val)){
                console.log("Invalid Value. Not Sending Request");
                return;
            }
            if(pre_method)
            {
                if(pre_func_kwargs.current)
                {
                    pre_method(...pre_func_kwargs.current);
                }else{
                    pre_method();
                }
            }
            // pre_method && pre_method(
            //     (pre_func_kwargs.current) ? ...pre_func_kwargs.current : null);
            const sendVal = {[valueName]: val};
            endpoint.put(sendVal, path)
                .then((response) => {
                    endpoint.mergeData(response, path);
                    if(post_method)
                    {
                        if(post_func_kwargs.current)
                        {
                            post_method(...post_func_kwargs.current);
                        }else{
                            post_method();
                        }
                    }
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
            timer.current = setInterval(() => {console.log("Timer Elapsed. Sending Data"); sendRequest(val)}, delay);
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

        return (<WrappedComponent {...eventProp} {...leftover_props} {...metadata.current} value={componentValue} ref={component} disabled={disable}/>);


    };

    return withEndpointComponent;
}

export default WithEndpoint;