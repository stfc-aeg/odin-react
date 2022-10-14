
import React, { useEffect, useState } from "react";
import Alert from 'react-bootstrap/Alert';
// import { useOdinContext } from "./odinContext";

function WithEndpoint(WrappedComponent)
{
    // const contextProps = useOdinContext();
    const withEndpointComponent = (props) => {
        const {endpoint, fullpath, value, type} = props;
        // const endpoint = contextProps[endpointName];
        // const endpoint = endpoint;
        // const [path, setPath] = useState("");
        // const [valueName, setValueName] = useState("");
        const [error, setError] = useState(null);
        const onEventHandler = (event, path, valueName) => {
            console.log("OnEvent Handler");
                console.log(event);
                let val = null;
                if(event.target.value){
                    val = event.target.value;
                }else{
                    val = value;
                }
    
                const sendVal = {[valueName]: val};
                console.log(sendVal);
                endpoint.put(sendVal, path)
                .then()
                .catch((err) => {
                    console.log(err);
                    setError(err)});
        }
        const [eventProp, setEventProp] = useState(null);


        useEffect(() => {
            console.log("Use Effect");
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
                case "change":
                    setEventProp({onChange: event => onEventHandler(event, _path, _valueName)});
                break;
                
                case "click":
                default:
                    setEventProp({onClick: event => onEventHandler(event, _path, _valueName)});
                break;
            }
        }, [fullpath]);

        
        if(error) 
        // return (<Alert variant="danger">ERROR: {error.message}</Alert>);
        throw error;

        return (<WrappedComponent {...eventProp} {...props}/>);


    };

    return withEndpointComponent;
}

export default WithEndpoint;