
import { Form } from 'react-bootstrap';
import type { FormControlProps } from 'react-bootstrap';
import { useRequestHandler, type EndpointProps } from './util';
import type { MetadataValue } from '../AdapterEndpoint/AdapterEndpoint.types';
import { getValueFromPath } from '../AdapterEndpoint';
import { CSSProperties, useEffect, useRef, useState } from 'react';


type EndpointInputProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    Omit<EndpointProps<PreArgs, PostArgs>, "value"> & Omit<FormControlProps, keyof Omit<EndpointProps<PreArgs, PostArgs>, "value">>;


const EndpointInput = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointInputProps<PreArgs, PostArgs>
) => {

    const {requestHandler, data: endVal, disable} = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const metaData: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);
    const [compVal, changeCompVal] = useState<FormControlProps['value']>("");
    const [editing, setEditing] = useState(false);
    
    const compMin = min ?? metaData?.min;
    const compMax = max ?? metaData?.max;

    const component = useRef<HTMLInputElement>(null);

    const type: FormControlProps["type"] = rest.type ??
        ["int", "float", "complex"].includes(metaData?.type ?? "") ? "number"
            : typeof endVal === "number" ? "number" : "";

    const style: CSSProperties = editing ? {backgroundColor: "var(--bs-highlight-bg)"} : {};

    const onChangeHandler: FormControlProps["onChange"] = (event) => {
        const target = event.target;
        const val = type == "number" ? Number(target.value) : target.value;

        changeCompVal(val);
        setEditing(!(val == endVal));
    }

    const onEnterHandler: FormControlProps["onKeyUp"] = (event) => {
        if(event.key === "Enter" && !event.shiftKey) {
            console.debug(fullpath, event);
            requestHandler(compVal);
            setEditing(false);
        }
    }

    useEffect(() => {
        //Endpoint Value changed, update component value if need be.
        const newVal = getValueFromPath<FormControlProps["value"]>(endpoint.data, fullpath);

        // check if the component is not currently active
        if(document.activeElement !== component.current && !editing && typeof newVal !== "undefined"){
            changeCompVal(newVal);
        }

    }, [endpoint.updateFlag, endVal]);

    return (
        <Form.Control ref={component} onChange={onChangeHandler} onKeyUp={onEnterHandler} value={compVal}
            min={compMin} max={compMax} disabled={disable} type={type} {...rest} style={style}/>
    )
}

export { EndpointInput };
