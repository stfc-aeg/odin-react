
import React, { useEffect, useState } from "react";

function WithEndpoint(WrappedComponent)
{

    const withEndpointComponent = (props) => {
        const {endpoint, fullpath, value, type} = props;
        const [error, setError] = useState(null);
        const onEventHandler = (event, path, valueName, eventKey) => {
            console.log("OnEvent Handler");
            console.log(event);
            console.log(eventKey);
            let val = null;
            if(event?.target?.value != null){
                                val = event.target.value;
                console.log(`Event Target Value: ${val}`);
            }else if(eventKey){
                val = eventKey;
                console.log(`Event Key: ${val}`);
            }else{
                val = value;
                console.log(`Value: ${val}`);
            }

            const sendVal = {[valueName]: val};
            console.log(path + ": " + valueName + ": " + val);
            endpoint.put(sendVal, path)
            .then()
            .catch((err) => {
                console.log(err);
                setError(err)});
        }
        const [eventProp, setEventProp] = useState(null);


        useEffect(() => {
            let _path = fullpath.trim('/');
            let _valueName = "";
            if(_path.includes("/"))
            {
                [_path, _valueName] = _path.split(/\/(?!.*\/)(.*)/, 2);
            }else{
                _valueName = _path;
                _path = "";
            }

            console.log(_path + ":" + _valueName);
            switch(type){
                case "select":
                    setEventProp({onSelect: (eventKey, event) => onEventHandler(event, _path, _valueName, eventKey)});
                break;
                
                case "click":
                    setEventProp({onClick: event => onEventHandler(event, _path, _valueName)});
                break;

                case "change":
                default:
                    setEventProp({onChange: event => onEventHandler(event, _path, _valueName)});
                break;
            }
        }, [fullpath, type]);

        
        if(error) 
        // return (<Alert variant="danger">ERROR: {error.message}</Alert>);
        throw error;

        return (<WrappedComponent {...eventProp} {...props}/>);


    };

    return withEndpointComponent;
}

export default WithEndpoint;