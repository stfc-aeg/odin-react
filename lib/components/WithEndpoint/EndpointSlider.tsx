import { useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip, type OverlayTriggerProps } from 'react-bootstrap';
import type { FormRangeProps } from "react-bootstrap/FormRange";
import FormRange from "react-bootstrap/FormRange";
import { getValueFromPath } from "../AdapterEndpoint";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { EndpointProps, useRequestHandler } from "./util";

interface  SliderAdditonalProps {
    /** Show a tooltip with value when manipulating the slider */
    showTooltip?: boolean;
    /** Set the placement of the tooltip if enabled */
    tooltipPlacement?: OverlayTriggerProps["placement"];
}

type EndpointRangeProps<PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>> =
    EndpointProps<PreArgs, PostArgs> & FormRangeProps & SliderAdditonalProps;

type PutEvent = Parameters<Required<FormRangeProps>["onMouseUp"]>[0] 
              | Parameters<Required<FormRangeProps>["onBlur"]>[0]


/**
 * Specialised Slider component designed to work with an Adapter Endpoint,
 * to set a numerical Parameter between a minimum and maximum.
 * 
 * The Minimum/Maximum limits can be set manually, or automatically obtained
 * from the Metadata of the Parameter.
 * 
 * Based on the [Bootstrap FormRange](https://react-bootstrap.netlify.app/docs/forms/range),
 * so all props available on that component can be set here.
 * 
 */
const EndpointSlider = <PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        showTooltip = true, tooltipPlacement = "auto",
        ...rest}: EndpointRangeProps<PreArgs, PostArgs>
) => {

    const {requestHandler, data, disable}  = useRequestHandler({
        endpoint, fullpath, disabled,
        pre_method, pre_args, post_method, post_args
    });

    const [compVal, changeCompVal] = useState(0);
    const metadata: MetadataValue| undefined = getValueFromPath(endpoint.metadata, fullpath);
    const compMin = min ?? metadata?.min;
    const compMax = max ?? metadata?.max;

    const component = useRef<HTMLInputElement>(null);

    const onChange: FormRangeProps["onChange"] = (event) => {
        const target = event.target;
        changeCompVal(target.valueAsNumber);
    }

    const onPut = (event: PutEvent) => {
        const target = event.target as HTMLInputElement;
        changeCompVal(target.valueAsNumber);
        requestHandler(target.valueAsNumber);
    }

    useEffect(() => {
        const newVal = getValueFromPath<number>(endpoint.data, fullpath);
        if(document.activeElement !== component.current && typeof newVal !== "undefined"){
            changeCompVal(newVal);
        }
    }, [endpoint.data, fullpath, data]);

    const tooltip = (
        <Tooltip id="tooltip">
            {compVal}
        </Tooltip>
    )

    if(showTooltip){
        return (
            <OverlayTrigger overlay={tooltip} placement={tooltipPlacement}>
                <FormRange {...rest} ref={component} min={compMin} max={compMax} disabled={disable}
                    onBlur={onPut} onMouseUp={onPut} onChange={onChange}
                    value={compVal}  />
            </OverlayTrigger>
        )
    } else {
        return (
            <FormRange {...rest} ref={component} min={compMin} max={compMax} disabled={disable}
                onBlur={onPut} onMouseUp={onPut} onChange={onChange}
                value={compVal}  />
        )
    }
}

export { EndpointSlider };
