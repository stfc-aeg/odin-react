import { useCallback, useMemo, useRef, useState,  } from "react";

import { AdapterEndpoint_t } from "../AdapterEndpoint";

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
    value: string | number | object | null;
    value_type: value_enum;
    event_type: event_enum;
    disabled: boolean;
    delay: number;  // TODO: We may not want to use a delay when using the Change event type? Discuss with team
    pre_method: Function | null;
    post_method: Function | null;
    pre_args: null | Array<any>;
    post_args: null | Array<any>;
}

type eventProp_t = (event: React.SyntheticEvent, eventKey?: number | string ) => void
type selectEvent_t = {onSelect?: eventProp_t,
                      onClick?: eventProp_t,
                      onKeyPress?: eventProp_t,
                      onChange?: eventProp_t

};

type WrappedProps = {value: ComponentProps["value"], disabled: ComponentProps['disabled']}

export const WithEndpoint = (WrappedComponent : React.FC<WrappedProps>) => 
{
    const WithEndpointComponent = (props: ComponentProps) => {
        const {endpoint, fullpath, value, value_type, event_type, disabled, delay=1000,
               pre_method=null, pre_args=null, post_method=null, post_args=null,
               ...leftover_props} = props;
        
        const propValue = useRef(value);
        const timer = useRef<NodeJS.Timeout>(undefined);
        const metadata = useRef(null);

        const pre_func_kwargs = useRef(pre_args);
        const post_func_kwargs = useRef(post_args);

        const [error, setError] = useState(null);
        const [eventProp, setEventProp] = useState<selectEvent_t | null>(null);

        const [componentValue, setComponentValue] = useState(value ?? '');
        

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

        const sendRequest = useCallback((val: any) => { //TODO: what type should Val be?
            clearInterval(timer.current);  //TODO: only required if using the delay change method, which might be removed
            //TODO: metadata based validation
            if(pre_method)
            {
                if(pre_func_kwargs.current)
                {
                    pre_method(...pre_func_kwargs.current);
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
                        if(post_func_kwargs.current){
                            post_method(...post_func_kwargs.current);
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
            console.log(event);
            sendRequest(eventKey);
        }

        const onClickHandler = (event: React.SyntheticEvent) => {
            console.log(event);
            let val = null;
            if(propValue.current?.tagName?.toLowerCase() === "button")
            {
                //special case for button components.
            }
        }

        useMemo(() => {
            switch(event_type){
                case event_enum.select:
                    setEventProp({onSelect: (event, eventKey) => onSelectHandler(event, eventKey)});
            }
        }, [event_type, value]);

        return (<WrappedComponent {...eventProp} {...leftover_props} value={componentValue} disabled={disabled}/>)

    }
}