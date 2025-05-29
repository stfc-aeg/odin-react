import React, { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import { AdapterEndpoint_t, isParamNode, JSON } from "../../types";
import { useError } from "../OdinErrorContext";

type event_t = "select" | "click" | "enter"
type value_t = "string" | "number" | "boolean" | "null" | "list" | "dict"

interface ComponentProps {
    endpoint: AdapterEndpoint_t;
    fullpath: string;
    value?: JSON;
    // value_type?: value_t;
    min?: number;
    max?: number;
    event_type?: event_t;
    disabled?: boolean;
    pre_method?: Function;
    post_method?: Function;
    pre_args?:Array<any>;
    post_args?:Array<any>;
    dif_color?: CSSProperties["backgroundColor"];
}

interface metadata_t {
    readOnly: boolean;
    min?: number;
    max?: number;
}

type selectEvent_t = {onSelect?: (eventKey: number | string, event: React.SyntheticEvent) => void,
                      onClick?: (event: React.MouseEvent) => void,
                      onKeyPress?: (event: React.KeyboardEvent) => void,
                      onChange?: (event: React.ChangeEvent) => void

};

type InjectedProps = metadata_t & selectEvent_t & {
    style?: React.CSSProperties,
    value?: JSON,
    disabled: boolean,
    ref: React.RefObject<HTMLInputElement | null>

}

export const WithEndpoint = <P extends object>(WrappedComponent : React.FC<P>) => 
{
    type WrapperComponentProps = React.PropsWithChildren<
             Omit<P, keyof InjectedProps> & ComponentProps>;

    const trimByChar = (string: string, character: string) => {
        const arr = Array.from(string);
        const first = arr.findIndex(char => char !==character);
        const last = arr.reverse().findIndex(char => char !== character);
        return (first === -1 && last === -1) ? '' : string.substring(first, string.length - last);
    }

    const WithEndpointComponent: React.FC<WrapperComponentProps> = (props) => {
        const {endpoint, fullpath, value, event_type, disabled,
               pre_method, pre_args, post_method, post_args, dif_color="var(--bs-highlight-bg)",
               min, max, ...leftoverProps} = props;
        
        

        const component = useRef<typeof WrappedComponent>(null);
        const ErrCTX = useError();

        //initialised with an OnChange handler to avoid the 
        // "You provided a `value` prop to a form field without an `onChange` handler" error, since
        // we will be assigning event handlers after component initialisation
        const [eventProp, setEventProp] = useState<selectEvent_t>({onChange: (event) => onChangeHandler(event)});

        const [componentValue, setComponentValue] = useState<typeof value>(value ?? undefined);
        const [endpointValue, setEndpointValue] = useState<typeof value>(value ?? undefined);
        const [metadata, setMetadata] = useState<metadata_t | null>(null);

        const [type, setType] = useState<value_t>("string");

        const style: CSSProperties = endpointValue == componentValue ? {} : {backgroundColor: dif_color};

        const disable = useMemo(() => {
            if(disabled !== undefined){
                return (disabled || endpoint.loading === "putting")
            }
            if(metadata){
                return endpoint.loading === "putting" || metadata.readOnly
            }
            return endpoint.loading === "putting";

        }, [endpoint.loading, disabled, metadata?.readOnly])

        const {path, valueName} = useMemo(() => {
            let path = "";
            let valueName = trimByChar(fullpath, "/");
            if(valueName.includes("/"))
            {
                [path, valueName] = valueName.split(/\/(?!.*\/)(.*)/, 2); // finds the last "/" in the string, and splits on that
            }
            return {path, valueName};
        }, [fullpath]);

        const validate = (value: ComponentProps['value']) => {
            if(metadata && typeof value == "number"){
                if(metadata.min && metadata.min > value){
                    throw Error(`Value ${value} below minimum ${metadata.min}`);
                }
                if(metadata.max && metadata.max < value){
                    throw Error(`Value ${value} above maxmium ${metadata.max}`);
                }
            }
        }

        const getValueFromEndpoint =  (): ComponentProps['value'] => {
            // let splitPath = path.split("/");
            let splitPath = fullpath.split("/");
            let data: JSON = endpoint.data;
            splitPath.forEach((path_part) => {
                if(isParamNode(data)){
                    data = data[path_part];
                }
            });
            if(data){
                return data as JSON as ComponentProps['value'];
            }else{
                return undefined;
            }

        }


        const getTypedValue = (val: ComponentProps['value']): ComponentProps['value'] => {
            switch(type){
                case "number":
                    val =  Number(val);
                    break;
                case "boolean":
                    val = Boolean(val);
                    break;
                case "list":
                    if(Array.isArray(val)){
                        val = Array.from(val);
                    }else{
                        if(typeof val == "string"){
                            val = val.split(",");
                        }
                    }
                    break;
                case "string":
                    val = String(val);
                    break;
                case "dict":
                case "null":
                    break;

            }

            return val;
        };

        useEffect(() => {
            //this effect is designed to run only when the component is first mounted, to get the data
            //and metadata of the part of the param tree we are interacting with, apply the metadata
            //validation to the component (writable, min, max) and sync the component value with the
            //value from the param tree
            const endpointLoaded = () => {
                for(var _ in endpoint.metadata) return true;
                return false;
            }
            if(endpointLoaded()){
                let data: JSON = endpoint.metadata;
                let splitPath = fullpath.split("/");
                splitPath.forEach((path_part) => {
                    if(isParamNode(data)){
                        data = data[path_part];
                    }
                });
                if(isParamNode(data) && "writeable" in data){ //metadata found
                    let tmp_metadata: metadata_t = {readOnly: ! (data['writeable'] as boolean)};
                    tmp_metadata.min = min ?? (data.min ? data.min as number : undefined);
                    tmp_metadata.max = max ?? (data.max ? data.max as number : undefined);

                    setMetadata(tmp_metadata);
                    setEndpointValue(value ?? data.value as ComponentProps["value"]);

                    switch(data.type as string){
                        case "int":
                        case "float":
                        case "complex":
                            setType("number");
                            break;
                        case "list":
                        case "tuple":
                        case "range":
                            setType("list");
                            break;
                        case "bool":
                            setType("boolean");
                            break;
                        case "str":
                            setType("string");
                            break;
                        case "NoneType":
                            setType("null");
                            break;
                        default:
                            setType(data.type as value_t);
                    }

                }else{
                    data = data as JSON;
                    console.log("Adapter has not implemented Metadata for", fullpath);
                    setEndpointValue(value ?? data as ComponentProps["value"]);
                    let data_type = (value == null ? typeof data : typeof value);
                    switch(data_type){
                        case "bigint":
                        case "number":
                            setType("number");
                            break;
                        case "object":
                            // gotta check type of object
                            switch(true){
                                case data instanceof Array:
                                    setType("list");
                                    break;
                                case data == null:
                                    setType("null");
                                    break;
                                default:
                                    setType("dict");
                            }
                            break;
                        case "function":
                        case "symbol":
                        case "undefined":
                            console.error("Something went wrong getting the typeof Data: ", data, typeof data);
                            break;
                        case "boolean":
                        case "string":
                            setType(data_type);

                            
                    }

                    if(min != null || max!= null){
                        let tmp_metadata: metadata_t = {readOnly: false, min: min, max: max};
                        setMetadata(tmp_metadata);
                    }
                    
                }
            }
        }, [endpoint.metadata]);

        useEffect(() => {
            // update flag got changed, check if we need to change anything
            if(value == null){  // if value is defined, we dont wanna overwrite anything
                let newVal = getValueFromEndpoint();
                if(newVal != endpointValue){
                    setEndpointValue(newVal);
                }
                // check if component value has been modified, or if the input is active. If so,
                // dont mess with the value. Otherwise, set the component val?
                // seems weird to be checking if the two values are the same specifically to change them
                if(document.activeElement !== component.current && value == null && endpointValue == componentValue){
                    setComponentValue(newVal);
                }
            }
        }, [endpoint.updateFlag, endpointValue]);

        const sendRequest = (val: ComponentProps['value']) => {
            try {
                val = getTypedValue(val);
                validate(val);
                

                if(pre_method)
                {
                    if(pre_args)
                    {
                        pre_method(...pre_args);
                    }else{
                        pre_method();
                    }
                }
                const sendVal = {[valueName]: val};

                endpoint.put(sendVal, path)
                    .then((response) => {
                        endpoint.mergeData(response, path);
                        if(post_method)
                        {
                            if(post_args){
                                post_method(...post_args);
                            }else{
                                post_method();
                            }
                        }
                    })
                    .catch((err) => {
                        ErrCTX.setError(err);
                    })
            }
            catch (err) {
                if(err instanceof Error){
                    ErrCTX.setError(err);
                }else{
                    ErrCTX.setError(Error("UNKNOWN ERROR OCCURED"));
                }
            }
        };

        const onSelectHandler = (event: React.SyntheticEvent, eventKey: number | string) => {
            console.debug(fullpath, "On Select Handler");
            console.debug(fullpath, "event: ", event);
            console.debug(fullpath, "EventKey: ", eventKey);
            
            sendRequest(eventKey);
        }

        const onClickHandler = (event: React.MouseEvent) => {
            console.debug(fullpath, "On Click Handler");
            console.debug(fullpath, event);
            let curComponent = component.current!;
            let val: ComponentProps['value'];
            if(value != null){
                val = value;
            }else{
                val = "value" in curComponent ? curComponent.value as ComponentProps['value'] : value;
            }
            sendRequest(val);
        };

        const onChangeHandler = (event: React.ChangeEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            let target = event.target;
            let val: ComponentProps['value'] = "";
        
            if("value" in target && target.value != null){
                val = target.value as ComponentProps['value'];
            }else
            if("value" in component.current!){
                val = component.current.value as ComponentProps['value'];
            }
            setComponentValue(val);
        };

        const onEnterHandler = (event: React.KeyboardEvent) => {
            if (event.key === "Enter" && !event.shiftKey) {
                console.debug(fullpath, "onEnterHandler");
                console.debug(fullpath, event);
                
                sendRequest(componentValue);
            }
        };

        useEffect(() => {
            switch(event_type){
                case "select":
                    setEventProp({onSelect: (eventKey, event) => onSelectHandler(event, eventKey)});
                    break;
                case "click":
                    setEventProp({onClick: (event) => onClickHandler(event)});
                    break;
                case "enter":
                default:
                    setEventProp({onKeyPress: (event) => onEnterHandler(event), onChange: (event) => onChangeHandler(event)});

            }
        }, [event_type, value, componentValue, component.current, type]);

        return (<WrappedComponent
                    {...leftoverProps as P}
                    style={style}
                    {...eventProp}
                    readOnly={metadata?.readOnly}
                    min={metadata?.min}
                    max={metadata?.max}
                    value={componentValue}
                    disabled={disable}
                    ref={component}
                />)

    }

    return (
        WithEndpointComponent
    )
};