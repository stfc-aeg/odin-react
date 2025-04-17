import { useCallback, useEffect, useMemo, useRef, useState,  } from "react";

import { AdapterEndpoint_t, isParamNode, paramLeaf, paramNode } from "../../types/types";

enum event_enum {
    "change",
    "select",
    "click",
    "enter"
}

enum value_enum {
    "string",
    "text",  // keeping text as an option for backwards compatability
    "number"
}

interface ComponentProps {
    endpoint: AdapterEndpoint_t;
    fullpath: string;
    value?: paramLeaf | null;
    value_type?: value_enum;
    event_type: event_enum;
    disabled?: boolean;
    delay?: number;  // TODO: We may not want to use a delay when using the Change event type? Discuss with team
    pre_method?: Function;
    post_method?: Function;
    pre_args?:Array<any>;
    post_args?:Array<any>;
    blockConsole?: boolean;
}

interface metadata_t {
    writeable: boolean;
    min?: number;
    max?: number;
}

type eventProp_t = (event: React.SyntheticEvent, eventKey?: number | string ) => void
type selectEvent_t = {onSelect?: eventProp_t,
                      onClick?: eventProp_t,
                      onKeyPress?: eventProp_t,
                      onChange?: eventProp_t

};

type WrappedProps = {value: ComponentProps["value"], disabled: ComponentProps['disabled'], ref: React.RefObject<HTMLElement | null>}

export const WithEndpoint = (WrappedComponent : React.FC<WrappedProps>) => 
{
    const WithEndpointComponent = (props: ComponentProps) => {
        const {endpoint, fullpath, value, value_type, event_type, disabled, delay=1000,
               pre_method, pre_args, post_method, post_args, blockConsole,
               ...leftover_props} = props;
        
        const component = useRef<HTMLInputElement>(null);
        // const timer = useRef<NodeJS.Timeout>(undefined);
        // const metadata = useRef(null);

        const [error, setError] = useState(null);  // mainly useful to see the error in the f12 inspector
        const [eventProp, setEventProp] = useState<selectEvent_t | null>(null);

        const [componentValue, setComponentValue] = useState<paramLeaf>(value ?? '');
        const [metadata, setMetadata] = useState<metadata_t | null>(null);
        
        const outputToConsole = (message?: any, ...optionalParams: any[]) =>
        {
            if(blockConsole){
                return
            }else{
                console.log(message, optionalParams);
            }
        }

        const getEndpointVal = () : paramNode | paramLeaf => {
            let val: paramNode | paramLeaf | paramLeaf[]= endpoint.data;
            let splitPath = fullpath.split("/");
            try {
                splitPath.forEach((path_part) => {
                    if(path_part && isParamNode(val)){
                        val = val[path_part];
                    }
                });
                return val;
            }catch(err){
                return "";
            }
        };

        const endpointValue = getEndpointVal();

        useEffect(() => {
            //this effect is designed to run only when the component is first mounted, to get the data
            //and metadata of the part of the param tree we are interacting with, apply the metadata
            //validation to the component (writable, min, max) and sync the component value with the
            //value from the param tree
            if(value){
                setComponentValue(value);
            }else{
                endpoint.get(fullpath, true)
                .then(response => {
                    let data = response[valueName];
                    if(isParamNode(data)){ //is it possible to receive an object as the data response and it NOT be metadata?
                        let tmp_metadata: metadata_t = {
                            writeable: data['writeable'] as boolean
                        };
                        tmp_metadata.min = data.min ? data.min as number : undefined;
                        tmp_metadata.max = data.max ? data.max as number : undefined;

                        setMetadata(tmp_metadata);
                        setComponentValue(data.value as paramLeaf);
                    }else{
                        outputToConsole("Adapter has not implemented Metadata");
                        setComponentValue(response[valueName] as paramLeaf);
                    }
                })
            }
        }, []) // no dependencies, intentionally so that is runs only at the start when the component mounts

        useEffect(() => {
            outputToConsole("Setting Component Value: %s", fullpath);
            setComponentValue(endpointValue as paramLeaf);
        }, [endpointValue]);

        const disable = useMemo(() => {
            if(disabled !== undefined){
                return (disabled || endpoint.loading === "putting")
            }
            if(metadata){
                return endpoint.loading === "putting" || ! metadata.writeable
            }
            return endpoint.loading === "putting";

        }, [endpoint.loading, disabled, metadata?.writeable])

        const validate = (value: number) => {
            let isValid = true;
            if(metadata){
                if(metadata.min && metadata.min > value){
                    outputToConsole("Value %f below min %f", value, metadata.min);
                    isValid = false;
                }
                if(metadata.max && metadata.max < value){
                    outputToConsole("Value %f above max %f", value, metadata.max);
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
            // clearInterval(timer.current);  //TODO: only required if using the delay change method, which might be removed
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
                    setError(err);
                })
        }, [endpoint]);

        const onSelectHandler = (event: React.SyntheticEvent, eventKey?: number | string) => {
            outputToConsole(event);
            
            sendRequest(eventKey!);  // the ! here tells typescript that we know eventKey is NOT undefined here
        }

        const onClickHandler = (event: React.SyntheticEvent) => {
            outputToConsole(event);
            let curComponent = component.current;
            let val: ComponentProps['value'] = null;
            if(curComponent?.tagName?.toLowerCase() === "button")
            {
                outputToConsole("Button Special Case");
                //special case for button components.
                val = value;
            }
            else if(curComponent?.value !== null && curComponent?.value !== undefined){
                outputToConsole("Current Component Value");
            }
            else if((event.target as HTMLInputElement | null)?.value){
                outputToConsole("Target Value");

                val = (event.target as HTMLInputElement).value;
            }
            else{
                val = value;
            }
            sendRequest(val);
        }

        const onChangeHandler = (event: React.SyntheticEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            let val: ComponentProps['value'] = null;
            let target = (event.target as HTMLInputElement | null);
            let curComponent = component.current;

            if(target?.value){
                //check if the value is a string, or COULD be a number (target.value is always a string
                //but we might want to convert it)
                if(value_type == value_enum.string || value_type == value_enum.text || isNaN(Number(target.value)))
                {
                    val = target.value;
                }
                else
                { 
                    val = Number(target.value);
                }
                
            }else if(curComponent?.value){
                //event target above is likely to be the current component, but on the off chance its not (or doesn't exist)
                //we can also use the current component ref
                if(value_type == value_enum.string || value_type == value_enum.text || isNaN(Number(curComponent!.value)))
                {
                    val = curComponent.value;
                }
                else
                {
                    val = Number(curComponent.value);
                }
            }else{ 
                //if, somehow, neither the current component has a value nor the event target, default the value
                if(value_type == value_enum.string || value_type == value_enum.text){
                    val = "none";
                }else{
                    val = 0;
                }
            }
            setComponentValue(val);
        }

        const onEnterHandler = (event: React.SyntheticEvent) => {
            if ((event as React.KeyboardEvent).key === "Enter" && (event as React.KeyboardEvent).shiftKey) {
                outputToConsole(event);
                sendRequest(componentValue);
            }
        }

        useMemo(() => {
            switch(event_type){
                case event_enum.select:
                    setEventProp({onSelect: (event, eventKey) => onSelectHandler(event, eventKey)});
                    break;
                case event_enum.click:
                    setEventProp({onClick: (event) => onClickHandler(event)});
                    break;
                case event_enum.enter:
                default:
                    setEventProp({onKeyPress: (event) => onEnterHandler(event), onChange: (event) => onChangeHandler(event)});

            }
        }, [event_type, value]);

        return (<WrappedComponent {...eventProp} {...leftover_props} {...metadata} value={componentValue} disabled={disable} ref={component}/>)

    }

    return WithEndpointComponent;
}