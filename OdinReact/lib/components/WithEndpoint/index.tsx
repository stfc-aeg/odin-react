import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdapterEndpoint_t, isParamNode, paramLeaf } from "../../types";
import './styles.module.css'

type event_t = "select" | "click" | "enter"
type value_t = "string" | "text" | "number"  //text is kept for backwards compatability

interface ComponentProps {
    endpoint: AdapterEndpoint_t;
    fullpath: string;
    value?: paramLeaf;
    value_type?: value_t;
    event_type?: event_t;
    disabled?: boolean;
    pre_method?: Function;
    post_method?: Function;
    pre_args?:Array<any>;
    post_args?:Array<any>;
}



interface metadata_t {
    readOnly: boolean;
    min?: number;
    max?: number;
}


type eventProp_t = (event: React.SyntheticEvent, eventKey?: number | string ) => void
type selectEvent_t = {onSelect?: eventProp_t,
                      onClick?: eventProp_t,
                      onKeyPress?: eventProp_t,
                      onChange?: eventProp_t

};

type InjectedProps = metadata_t & selectEvent_t & {
    style?: React.CSSProperties,
    value?: paramLeaf,
    disabled: boolean,
    ref: React.RefObject<HTMLInputElement | null>

}

export const WithEndpoint = <P extends object>(WrappedComponent : React.FC<P>) => 
{
    // type WrappedComponentInstance = InstanceType<typeof WrappedComponent>;
    type WrapperComponentProps = React.PropsWithChildren<
             Omit<P, keyof InjectedProps> & ComponentProps>;
    // type WrapperComponentInstance = InstanceType<typeof WrappedComponent>;

    // type leftoverPropsType = P;

    const WithEndpointComponent = (props: WrapperComponentProps) => {
        const {endpoint, fullpath, value, value_type, event_type, disabled,
               pre_method, pre_args, post_method, post_args, ...leftoverProps} = props;
        
        

        const component = useRef<typeof WrappedComponent>(null);
        // const timer = useRef<NodeJS.Timeout>(undefined);
        // const metadata = useRef(null);

        // const [error, setError] = useState(null);  // mainly useful to see the error in the f12 inspector
        const [eventProp, setEventProp] = useState<selectEvent_t | null>(null);

        const [componentValue, setComponentValue] = useState<paramLeaf | undefined>(value ?? undefined);
        const [endpointValue, setEndpointValue] = useState<paramLeaf>(value ?? "");
        const [metadata, setMetadata] = useState<metadata_t | null>(null);

        const style: React.CSSProperties = endpointValue == componentValue ? {} : {backgroundColor: "#E4A11B"};
        
        useEffect(() => {
            //this effect is designed to run only when the component is first mounted, to get the data
            //and metadata of the part of the param tree we are interacting with, apply the metadata
            //validation to the component (writable, min, max) and sync the component value with the
            //value from the param tree
            if(value){
                setComponentValue(value);
                setEndpointValue(value);
            }else{
                endpoint.get(fullpath, true)
                .then(response => {
                    let data = response[valueName];
                    if(isParamNode(data)){ //is it possible to receive an object as the data response and it NOT be metadata?
                        let tmp_metadata: metadata_t = {
                            readOnly: ! (data['writeable'] as boolean)
                        };
                        tmp_metadata.min = data.min ? data.min as number : undefined;
                        tmp_metadata.max = data.max ? data.max as number : undefined;

                        setMetadata(tmp_metadata);
                        setComponentValue(data.value as paramLeaf);
                        setEndpointValue(data.value as paramLeaf);
                    }else{
                        console.log("Adapter has not implemented Metadata");
                        setComponentValue(response[valueName] as paramLeaf);
                        setEndpointValue(response[valueName] as paramLeaf);
                    }
                })
            }
        }, []) // no dependencies, intentionally so that it runs only at the start when the component mounts

        useEffect(() => {
            console.log("Setting Component Value: %s", fullpath);
            setComponentValue(endpointValue as paramLeaf);
        }, [endpointValue]);

        const disable = useMemo(() => {
            if(disabled !== undefined){
                return (disabled || endpoint.loading === "putting")
            }
            if(metadata){
                return endpoint.loading === "putting" || metadata.readOnly
            }
            return endpoint.loading === "putting";

        }, [endpoint.loading, disabled, metadata?.readOnly])

        const validate = (value: number) => {
            let isValid = true;
            if(metadata){
                if(metadata.min && metadata.min > value){
                    console.log("Value %f below min %f", value, metadata.min);
                    isValid = false;
                }
                if(metadata.max && metadata.max < value){
                    console.log("Value %f above max %f", value, metadata.max);
                    isValid = false;
                }
            }
            return isValid;
        }

        const trimByChar = (string: string, character: string) => {
            const arr = Array.from(string);
            const first = arr.findIndex(char => char !==character);
            const last = arr.reverse().findIndex(char => char !== character);
            return (first === -1 && last === -1) ? '' : string.substring(first, string.length - last);
        }

        const {path, valueName} = useMemo(() => {
            let path = "";
            let valueName = trimByChar(fullpath, "/");
            if(valueName.includes("/"))
            {
                [path, valueName] = valueName.split(/\/(?!.*\/)(.*)/, 2); // finds the last "/" in the string, and splits on that
            }
            return {path, valueName};
        }, [fullpath]);

        const sendRequest = useCallback((val: ComponentProps['value']) => {
            if(typeof val === "number"){
                validate(val);  // check against the metadata provided to see if val is out of range
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
                    setEndpointValue(val!);
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
                    console.log(err);
                })
        }, [endpoint.put]);

        const onSelectHandler = (event: React.SyntheticEvent, eventKey?: number | string) => {
            console.log(event);
            
            sendRequest(eventKey!);  // the ! here tells typescript that we know eventKey is NOT undefined here
        }

        const onClickHandler = useCallback((event: React.SyntheticEvent) => {
            console.log(event);
            let curComponent = component.current!;
            let val: ComponentProps['value'] = "value" in curComponent ? curComponent.value as ComponentProps['value'] : undefined;
            let tag = "tagName" in curComponent ?  curComponent.tagName : "";
            if(tag === "button")
            {
                console.log("Button Special Case");
                //special case for button components.
                val = value;
            }
            else if(val !== null && val !== undefined){
                console.log("Current Component Value");
            }
            else if((event.target as HTMLInputElement | null)?.value){
                console.log("Target Value");

                val = (event.target as HTMLInputElement).value;
            }
            else{
                val = value;
            }
            sendRequest(val);
        }, [component, value]);

        const onChangeHandler = useCallback((event: React.SyntheticEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            
            let target = (event.target as HTMLInputElement | null);
            let curComponent = component.current!;
            let val: ComponentProps['value'] = "value" in curComponent ? curComponent.value as ComponentProps['value'] : undefined;

            if(target?.value){
                //check if the value is a string, or COULD be a number (target.value is always a string
                //but we might want to convert it)
                if(value_type == "string" || value_type == "text" || isNaN(Number(target.value)))
                {
                    val = target.value;
                }
                else
                { 
                    val = Number(target.value);
                }
                
            }else if(val){
                //event target above is likely to be the current component, but on the off chance its not (or doesn't exist)
                //we can also use the current component ref
                if(!(value_type == "string" || value_type == "text" || isNaN(Number(val))))
                {
                    val = Number(val);
                }
            }else{ 
                //if, somehow, neither the current component has a value nor the event target, default the value
                if(value_type == "string" || value_type == "text"){
                    val = "";
                }else{
                    val = 0;
                }
            }
            setComponentValue(val);
        }, [component, value_type]);

        const onEnterHandler = useCallback((event: React.SyntheticEvent) => {
            if ((event as React.KeyboardEvent).key === "Enter" && !(event as React.KeyboardEvent).shiftKey) {
                console.log(event);
                console.log("componentValue:", componentValue);
                
                sendRequest(componentValue);
            }
        }, [componentValue, onChangeHandler]);

        useEffect(() => {
            switch(event_type){
                case "select":
                    setEventProp({onSelect: (event, eventKey) => onSelectHandler(event, eventKey)});
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
    // {...leftoverProps as P}
    // style={style}
    // {...eventProp}
    // {...metadata}
    // value={componentValue}
    // disabled={disable}
    // ref={component}
    // return WithEndpointComponent;
    return (
        WithEndpointComponent
    )
};