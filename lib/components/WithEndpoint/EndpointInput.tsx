
import { CSSProperties, useEffect, useRef, useState } from 'react';
import type { FormControlProps } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { getValueFromPath } from '../AdapterEndpoint';
import type { MetadataValue } from '../AdapterEndpoint/AdapterEndpoint.types';
import { useRequestHandler, type EndpointProps } from './util';


type EndpointInputProps<PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>> =
    EndpointProps<PreArgs, PostArgs> & Omit<FormControlProps, keyof EndpointProps<PreArgs, PostArgs>>;


/**
 * Specialised Input component designed to work with a Parameter on the Parameter Tree
 * 
 * Based on the [Bootstrap Form.Control](https://react-bootstrap.netlify.app/docs/forms/form-control),
 * so all props available on that component can be set here.
 * 
 * Performs the PUT request when the user hits the Enter key after changing the value.
 * 
 * Can be used for both string and number based Parameters.
 */
const EndpointInput = <PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointInputProps<PreArgs, PostArgs>
) => {

    const { requestHandler, data: endVal, disable } = useRequestHandler({
        endpoint, fullpath, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const metaData: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);
    const [editing, setEditing] = useState(false);

    const compMin = min ?? metaData?.min;
    const compMax = max ?? metaData?.max;

    const component = useRef<HTMLInputElement>(null);

    const type: FormControlProps["type"] = rest.type ??
        ["int", "float", "complex"].includes(metaData?.type ?? "") ? "number"
        : typeof endVal === "number" ? "number" : "";

    const style: CSSProperties = editing ? { backgroundColor: "var(--bs-highlight-bg)" } : {};

    const onChangeHandler: FormControlProps["onChange"] = (event) => {
        const target = event.target;
        const val = type == "number" ? Number(target.value) : target.value;

        setEditing(!(val == endVal));
    }

    const onEnterHandler: FormControlProps["onKeyUp"] = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            const target = event.target as HTMLInputElement;
            const val = type == "number" ? target.valueAsNumber : target.value;
            requestHandler(val);
            setEditing(false);
        }
    }

    useEffect(() => {
        //Endpoint Value changed, update component value if need be.
        const newVal = getValueFromPath<FormControlProps["value"]>(endpoint.data, fullpath);

        // check if the component is not currently active
        if (document.activeElement !== component.current && !editing && typeof newVal !== "undefined") {
            if(component.current) {
                component.current.value = newVal.toString();
            }
        }

    }, [endpoint.data, fullpath, editing, endVal]);

    return (
        <Form.Control ref={component} onChange={onChangeHandler} onKeyUp={onEnterHandler}
            min={compMin} max={compMax} disabled={disable} type={type} style={style} {...rest}  />
    )
}

export { EndpointInput };
