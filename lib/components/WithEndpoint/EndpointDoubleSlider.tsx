import { type EndpointProps, useRequestHandler } from "./util";

import { OdinDoubleSlider } from "../OdinDoubleSlider";
import type { SliderProps } from "../OdinDoubleSlider";
import { ComponentProps, useRef, useState, useEffect } from "react";
import { getValueFromPath } from "../AdapterEndpoint";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";

type EndpointDoubleSliderProps<PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>> =
    EndpointProps<PreArgs, PostArgs> & SliderProps;

/**
 * Specialised Double Slider component designed to perform PUT request to
 * a parameter in an Odin Control Adapter when the value is set.
 * 
 * Based on the OdinDoubleSlider, so all props available on that component
 * can also be set here.
 * 
 * Designed to be used with a Parameter that represents a min and max
 * value of some sort as a pair of numbers in an array.
 */
const EndpointDoubleSlider = <PreArgs extends Record<string, unknown>, PostArgs extends Record<string, unknown>>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointDoubleSliderProps<PreArgs, PostArgs>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args, post_method, post_args
    });

    const [compVal, changeCompVal] = useState<ComponentProps<typeof OdinDoubleSlider>["value"]>([0, 100]);
    const metadata: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);
    const compMin = min ?? metadata?.min;
    const compMax = max ?? metadata?.max;

    const component = useRef<HTMLDivElement>(null);

    const onChange: ComponentProps<typeof OdinDoubleSlider>["onChange"] = (event) => {
        const target = event.target;

        changeCompVal(target.value);
    }

    const onMouseUp: ComponentProps<typeof OdinDoubleSlider>['onMouseUp'] = (event) => {
        console.debug(event);
        requestHandler(compVal);
    }

    useEffect(() => {
        const newVal = getValueFromPath<number[]>(endpoint.data, fullpath);
        if (typeof newVal !== "undefined" && !component.current?.contains(document.activeElement)) {
            changeCompVal(newVal);
        }
    }, [endpoint.updateFlag, data]);



    return (
        <OdinDoubleSlider {...rest} ref={component} min={compMin} max={compMax} value={compVal}
            onChange={onChange} onMouseUp={onMouseUp} disabled={disable}  />
    )

}

export { EndpointDoubleSlider };