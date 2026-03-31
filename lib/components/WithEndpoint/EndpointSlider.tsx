import { FocusEventHandler, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip, type OverlayTriggerProps } from 'react-bootstrap';
import type { FormRangeProps } from "react-bootstrap/FormRange";
import FormRange from "react-bootstrap/FormRange";
import { getValueFromPath } from "../AdapterEndpoint";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { EndpointProps, useRequestHandler } from "./util";

interface  SliderAdditonalProps {
    showTooltip?: boolean;
    tooltipPlacement?: OverlayTriggerProps["placement"];
}

type EndpointRangeProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & FormRangeProps & SliderAdditonalProps;

type PutEvent = Parameters<Required<FormRangeProps>["onMouseUp"]>[0] 
              | Parameters<Required<FormRangeProps>["onBlur"]>[0]

const EndpointSlider = <PreArgs extends unknown[], PostArgs extends unknown[]>(
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
    }, [endpoint.updateFlag, data]);

    const tooltip = (
        <Tooltip id="tooltip">
            {compVal}
        </Tooltip>
    )

    if(showTooltip){
        return (
            <OverlayTrigger overlay={tooltip} placement={tooltipPlacement}>
                <FormRange ref={component} min={compMin} max={compMax} disabled={disable}
                    onBlur={onPut} onMouseUp={onPut} onChange={onChange}
                    value={compVal} {...rest} />
            </OverlayTrigger>
        )
    } else {
        return (
            <FormRange ref={component} min={compMin} max={compMax} disabled={disable}
                onBlur={onPut} onMouseUp={onPut} onChange={onChange}
                value={compVal} {...rest} />
        )
    }
}

export { EndpointSlider };
