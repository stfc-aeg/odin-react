import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdapterEndpoint_t, isParamNode, JSON, NodeJSON } from "../../types";

type event_t = "select" | "click" | "enter"
type value_t = "string" | "number"  // only types we care about if we're defining this

interface ComponentProps {
    endpoint: AdapterEndpoint_t;
    fullpath: string;
    value?: Exclude<JSON, NodeJSON>;
    value_type?: value_t;
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
        const {endpoint, fullpath, value, value_type, event_type, disabled,
               pre_method, pre_args, post_method, post_args, dif_color="var(--bs-highlight-bg)", ...leftoverProps} = props;
        
        

        const component = useRef<typeof WrappedComponent>(null);
        // const timer = useRef<NodeJS.Timeout>(undefined);
        // const metadata = useRef(null);

        //initialised with an OnChange handler to avoid the 
        // "You provided a `value` prop to a form field without an `onChange` handler" error, since
        // we will be assigning event handlers after component initialisation
        const [eventProp, setEventProp] = useState<selectEvent_t>({onChange: (event) => onChangeHandler(event)});

        const [componentValue, setComponentValue] = useState<typeof value>(value ?? 0);
        const [endpointValue, setEndpointValue] = useState<typeof value>(value ?? 0);
        const [metadata, setMetadata] = useState<metadata_t | null>(null);

        const [type, setType] = useState<value_t>(value_type || "string");

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

        const validate = (value: number) => {
            let isValid = true;
            if(metadata){
                if(metadata.min && metadata.min > value){
                    console.debug(fullpath, "Value %f below min %f", value, metadata.min);
                    isValid = false;
                }
                if(metadata.max && metadata.max < value){
                    console.debug(fullpath, "Value %f above max %f", value, metadata.max);
                    isValid = false;
                }
            }
            return isValid;
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
                return "";
            }

        }

        const getTypedValue = (val: ComponentProps['value']): ComponentProps['value'] => {
            if(type == "number"){
                return Number(val);
            }else{
                return val;
            }
        }

        useEffect(() => {
            //this effect is designed to run only when the component is first mounted, to get the data
            //and metadata of the part of the param tree we are interacting with, apply the metadata
            //validation to the component (writable, min, max) and sync the component value with the
            //value from the param tree
            const isMetadata = () => {
                for(var _ in endpoint.metadata) return true;
                return false;
            }

            if((value == null) && isMetadata()){

                let data: JSON = endpoint.metadata;
                let splitPath = fullpath.split("/");
                splitPath.forEach((path_part) => {
                    if(isParamNode(data)){
                        data = data[path_part];
                    }
                });
                if(isParamNode(data) && "writeable" in data){ //metadata found
                        let tmp_metadata: metadata_t = {readOnly: ! (data['writeable'] as boolean)};
                    tmp_metadata.min = data.min ? data.min as number : undefined;
                    tmp_metadata.max = data.max ? data.max as number : undefined;

                    setMetadata(tmp_metadata);
                    setEndpointValue(data.value as ComponentProps["value"]);

                    if(!value_type){
                        if(["int", "float", "complex"].includes(data.type as string)){
                            setType("number");
                        }else{
                            setType("string");
                        }
                    }
                }else{
                    data = data as JSON;
                    console.log("Adapter has not implemented Metadata for", fullpath);
                    setEndpointValue(data as ComponentProps["value"]);
                    if(!value_type){
                        if(typeof data === "number") setType("number"); else setType("string");
                    }
                    
                }
            }else if(!value_type){
                    if(typeof value === "number") setType("number"); else setType("string");
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

        const sendRequest = useCallback((val: ComponentProps['value']) => {
            if(typeof val === "number"){
                // check against the metadata provided to see if val is out of range
                if(!validate(val)){
                    console.error("Invalid Value based on metadata. Not sending request");
                    console.error("Value: ", val, "Metadata: ", metadata);
                    return
                };
            }

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
                    // setError(err);
                    console.error(err);
                })
        }, [endpoint.put]);

        const onSelectHandler = (event: React.SyntheticEvent, eventKey: number | string) => {
            console.debug(fullpath, "On Select Handler");
            console.debug(fullpath, "event: ", event);
            console.debug(fullpath, "EventKey: ", eventKey);
            
            sendRequest(eventKey);
        }

        const onClickHandler = useCallback((event: React.MouseEvent) => {
            console.debug(fullpath, "On Click Handler");
            console.debug(fullpath, event);
            let curComponent = component.current!;
            let val: ComponentProps['value'];
            if(value != null){
                val = value;
            }else{
                val = "value" in curComponent ? curComponent.value as ComponentProps['value'] : value;
            }
            val = getTypedValue(val);
            sendRequest(val);
        }, [component, value]);

        const onChangeHandler = useCallback((event: React.ChangeEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            let target = event.target as HTMLInputElement;
            let val: ComponentProps['value'];
        
            if(target.value != null){
                //check if the value is a string, or COULD be a number (target.value is always a string
                //but we might want to convert it)
                val = getTypedValue(target.value);
            }else{ 
                //if, somehow, neither the current component has a value nor the event target, default the value
                val = getTypedValue("");
            }
            setComponentValue(val);
        }, [component, type]);

        const onEnterHandler = useCallback((event: React.KeyboardEvent) => {
            if (event.key === "Enter" && !event.shiftKey) {
                console.debug(fullpath, "onEnterHandler");
                console.debug(fullpath, event);
                
                sendRequest(componentValue);
            }
        }, [componentValue, onChangeHandler]);

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
        }, [event_type, value, componentValue, component.current]);

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