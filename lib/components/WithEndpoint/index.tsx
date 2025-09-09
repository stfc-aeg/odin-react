import React, { CSSProperties, useEffect, useMemo, useRef, useState, useTransition } from "react";

import type { AdapterEndpoint_t, JSON } from "../AdapterEndpoint";
import { isParamNode, getValueFromPath } from "../AdapterEndpoint";
import { useError } from "../OdinErrorContext";
import { isEqual } from 'lodash';

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
    pre_method?: (...args: unknown[]) => void;
    post_method?: (...args: unknown[]) => void;
    pre_args?:Array<unknown>;
    post_args?:Array<unknown>;
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

const trimByChar = (string: string, character: string) => {
        const arr = Array.from(string);
        const first = arr.findIndex(char => char !==character);
        const last = arr.reverse().findIndex(char => char !== character);
        return (first === -1 && last === -1) ? '' : string.substring(first, string.length - last);
    }

const WithEndpoint = <P extends object>(WrappedComponent : React.FC<P>) => 
{
    type WrapperComponentProps = React.PropsWithChildren<
             Omit<P, keyof InjectedProps> & ComponentProps>;


    const WithEndpointComponent: React.FC<WrapperComponentProps> = (props) => {
        const {endpoint, fullpath, value, event_type, disabled,
               pre_method, pre_args, post_method, post_args, dif_color="var(--bs-highlight-bg)",
               min, max, ...leftoverProps} = props;
        
        

        const component = useRef<Element>(null);
        const ErrCTX = useError();

        //initialised with an OnChange handler to avoid the 
        // "You provided a `value` prop to a form field without an `onChange` handler" error, since
        // we will be assigning event handlers after component initialisation
        const [eventProp, setEventProp] = useState<selectEvent_t>({onChange: (event) => onChangeHandler(event)});

        const [componentValue, setComponentValue] = useState<typeof value>(value ?? undefined);
        const [endpointValue, setEndpointValue] = useState<typeof value>(value ?? undefined);
        const [metadata, setMetadata] = useState<metadata_t | null>(null);

        const [type, setType] = useState<value_t>("string");

        const [isPending, startTransition] = useTransition();

        const changedStyle: CSSProperties = {
            backgroundColor: dif_color,
            color: "var(--bs-body-color)"
        }
        const style: CSSProperties = ["null", "list", "dict"].includes(type) ? 
                isEqual(endpointValue, componentValue) ? {} : changedStyle :
                componentValue == endpointValue ? {} : changedStyle;

        const disable = useMemo(() => {
            if(disabled !== undefined){
                return (disabled || isPending || endpoint.loading)
            }
            if(metadata){
                return isPending || endpoint.loading || metadata.readOnly
            }
            return isPending || endpoint.loading;

        }, [isPending, endpoint.loading, disabled, metadata?.readOnly]);

        const {path, valueName} = useMemo(() => {
            let path = "";
            let valueName = trimByChar(fullpath, "/");
            if(valueName.includes("/"))
            {
                [path, valueName] = valueName.split(/\/(?!.*\/)(.*)/, 2); // finds the last "/" in the string, and splits on that
            }
            return {path, valueName};
        }, [fullpath]);

        const componentPassedValue = useMemo(() => {
            const curComponent = component.current;
            if(curComponent){
                // coded using switch case to future proof if there's other special case component types
                switch(curComponent.nodeName){
                    case "INPUT":
                        {
                            const input_type = (curComponent as HTMLInputElement).type;
                            switch(input_type){
                                case "checkbox":
                                case "radio":
                                    return {checked: componentValue};
                                default:
                                    return {value: componentValue};
                            }
                        }
                    default:
                        return {value: componentValue};
                }
            }
            return {value: componentValue};
        }, [component.current, componentValue]);

        const validate = (value: ComponentProps['value']) => {
            if(metadata && typeof value == "number"){
                if(metadata.min && metadata.min > value){
                    throw Error(`Value ${value} below minimum ${metadata.min}`);
                }
                if(metadata.max && metadata.max < value){
                    throw Error(`Value ${value} above maximum ${metadata.max}`);
                }
            }
        }

        const getTypedValue = (val: ComponentProps['value']): ComponentProps['value'] => {
            switch(type){
                case "number":
                    val =  Number(val);
                    break;
                case "boolean":
                    if(typeof val === "string" && val.toLowerCase() === "false"){
                        val = false;
                    }else{val = Boolean(val);}
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
                for(const _ in endpoint.metadata) return true;
                return false;
            }
            if(endpointLoaded() && endpoint.status != "error"){
                let data = getValueFromPath<ComponentProps['value']>(endpoint.metadata, fullpath);
                let val: JSON;
                const tmp_metadata: metadata_t = {readOnly: false, min: min, max: max};
                if(isParamNode(data) && "writeable" in data){ //metadata found
                    tmp_metadata.readOnly = !(data['writeable'] as boolean);
                    tmp_metadata.min = min ?? (data.min ? data.min as number : undefined);
                    tmp_metadata.max = max ?? (data.max ? data.max as number : undefined);

                    // setMetadata(tmp_metadata);
                    val = value ?? data.value as ComponentProps["value"];

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
                    data = getValueFromPath<ComponentProps['value']>(endpoint.data, fullpath);
                    console.debug("Adapter has not implemented Metadata for", fullpath);
                    val = value ?? data as ComponentProps["value"];
                    const data_type = (value == null ? typeof data : typeof value);
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
                        case "undefined": {
                            console.error("Something went wrong getting the typeof Data: ", data, typeof data);
                            const error = new Error(`Invalid Data type ${data_type} for path ${fullpath}. If Undefined, check fullPath is correct`);
                            ErrCTX.setError(error);
                            break;
                        }
                        case "boolean":
                        case "string":
                            setType(data_type);
                    }
                }
                setEndpointValue(val);
                setComponentValue(val);
                setMetadata(tmp_metadata);
            }
        }, [endpoint.metadata]);

        useEffect(() => {
            // update flag got changed, check if we need to change anything
            if(value == null){  // if value is defined, we dont wanna overwrite anything
                const newVal = getValueFromPath<ComponentProps['value']>(endpoint.data, fullpath);
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

                startTransition(async () => {

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
                })
            }
            catch (err) {
                if(err instanceof Error){
                    ErrCTX.setError(err);
                }else{
                    ErrCTX.setError(Error("UNKNOWN ERROR OCCURRED"));
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
            console.debug(fullpath, event);
            const curComponent = component.current!;
            let val: ComponentProps['value'];
            if(value != null){
                val = value;
            }else{
                const compType = component.current!.nodeName;
                // if the type of component is a checkbox or a radio button, get the value from the "checked" prop
                if(compType === "INPUT" && ["checkbox", "radio"].includes((component.current! as HTMLInputElement).type)){
                        val = (component.current! as HTMLInputElement).checked;
                }else{
                    val = "value" in curComponent ? curComponent.value as ComponentProps['value'] : value;
                }
            }
            sendRequest(val);
        };

        const onChangeHandler = (event: React.ChangeEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            const target = event.target;
            let val: ComponentProps['value'] = "";
        
            if("value" in target && target.value != null){
                val = target.value as ComponentProps['value'];
            }else
            if("value" in component.current!){
                val = component.current.value as ComponentProps['value'];
            }
            setComponentValue(val);

            // special case. If the underlying component is a html <select> tag, send the request
            // without needing the onEnterHandler
            const compType = component.current?.nodeName;
            if(compType === "SELECT"){
                sendRequest(val);
            }
        };

        const onEnterHandler = (event: React.KeyboardEvent) => {
            if (event.key === "Enter" && !event.shiftKey) {
                sendRequest(componentValue);
            }
        };

        useEffect(() => {
            let events: selectEvent_t = {onKeyPress: (event) => onEnterHandler(event), onChange: (event) => onChangeHandler(event)};
            if(event_type){
                switch(event_type){
                    case "select":
                        events = {onSelect: (eventKey, event) => onSelectHandler(event, eventKey)};
                        break;
                    case "click":
                        events = {onClick: (event) => onClickHandler(event)};
                        break;
                    case "enter":
                    default:
                        break;
                }
            }else{
                const curComponent = component.current;
                if(curComponent){
                    switch(curComponent.nodeName){
                        case "BUTTON":
                            //default buttons to using the onClick event handler
                            events = {onClick: (event) => onClickHandler(event)};
                            break;

                        case "INPUT": 
                        {
                            const input_type = (curComponent as HTMLInputElement).type;
                            switch(input_type){
                                case "checkbox":
                                case "radio":
                                    //default checkboxes and radios to using the onClick event handler
                                    events = {onClick: (event) => onClickHandler(event)};
                                    break;
                                case "text":
                                case "number":
                                default:
                                    break;
                            }
                            break;
                        }
                        case "DIV":
                        {
                            const divClass = (curComponent as HTMLDivElement).className;
                            if(divClass === "dropdown"){
                                //bootstrap dropdowns are contained in a div with a classname of "dropdown"
                                events = {onSelect: (eventKey, event) => onSelectHandler(event, eventKey)};
                            }
                            break;
                        }
                        case "SELECT":
                            // the onSelect event handler is a specially created one for bootstrap dropdowns
                            // standard html dropdowns (<select> tags) use the onChange event handler by default
                           events = {onChange: (event) => onChangeHandler(event)};
                            break;
                    }
                }
            }
            setEventProp(events);
        }, [event_type, value, componentValue, component.current, type]);

        return (<WrappedComponent
                    {...leftoverProps as P}
                    style={style}
                    {...eventProp}
                    readOnly={metadata?.readOnly}
                    min={metadata?.min}
                    max={metadata?.max}
                    {...componentPassedValue}
                    disabled={disable}
                    ref={component}
                />)

    }

    return (
        WithEndpointComponent
    )
};


export { WithEndpoint, trimByChar };