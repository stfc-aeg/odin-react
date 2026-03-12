import FormRange from "react-bootstrap/FormRange";
import type { FormRangeProps } from "react-bootstrap/FormRange";
import { EndpointProps, useRequestHandler } from "./util";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { getValueFromPath } from "../AdapterEndpoint";
import { useState } from "react";

type EndpointRangeProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & FormRangeProps;


const EndpointSlider = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest}: EndpointRangeProps<PreArgs, PostArgs>
) => {

    const {requestHandler, disable}  = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args, post_method, post_args
    });

    const [compVal, changeCompVal] = useState(0);
    const metadata: MetadataValue| undefined = getValueFromPath(endpoint.metadata, fullpath);
    const compMin = min ?? metadata?.min;
    const compMax = max ?? metadata?.max;

    const onChange: FormRangeProps["onChange"] = (event) => {
        const target = event.target;
        changeCompVal(Number(target.value))
    }
    const onMouseUp: FormRangeProps["onMouseUp"] = (event) => {
        const target = event.target as HTMLInputElement;
        requestHandler(target.value);
    }

    return (
        <FormRange min={compMin} max={compMax} disabled={disable}
            onMouseUp={onMouseUp} onChange={onChange} value={compVal} {...rest}/>
    )
}

export { EndpointSlider };