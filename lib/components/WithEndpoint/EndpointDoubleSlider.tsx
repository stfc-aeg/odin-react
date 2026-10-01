import { type EndpointProps, type ArgType, useRequestHandler } from "./util";

import { OdinDoubleSlider } from "../OdinDoubleSlider";
import type { SliderProps } from "../OdinDoubleSlider";
import { ComponentProps, useRef, useState, useEffect } from "react";
import { getValueFromPath } from "../AdapterEndpoint";
import { MetadataValue, ParamPath, ParamTree, AdapterEndpoint } from "../AdapterEndpoint/AdapterEndpoint.types";

interface DoubleSliderAdditionalProps<Tree extends Record<Extract<keyof Tree, string>, ParamTree>> {
    /** Endpoint to connect to */
    endpoint: AdapterEndpoint<Tree>;
    /** Path to the Parameter(s) to control with this component */
    fullpath: ParamPath<Tree> | [ParamPath<Tree>, ParamPath<Tree>];

}

type EndpointDoubleSliderProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    DoubleSliderAdditionalProps<Tree> & Omit<EndpointProps<PreArgs, PostArgs, Tree>, "fullpath"> & SliderProps;



const isDoubleFullpath = <Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(path: ParamPath<Tree> | [ParamPath<Tree>, ParamPath<Tree>]): path is [ParamPath<Tree>, ParamPath<Tree>] => {
    return typeof path !== "string";
}
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
const EndpointDoubleSlider = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointDoubleSliderProps<PreArgs, PostArgs, Tree>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath: isDoubleFullpath(fullpath) ? fullpath[0] : fullpath, value, disabled,
        pre_method, pre_args, post_method, post_args
    });

    const { requestHandler: other_requestHandler, data: other_data, disable: other_disable } = isDoubleFullpath(fullpath) ?
        useRequestHandler({
            endpoint, fullpath: fullpath[1], value, disabled,
            pre_method, pre_args, post_method, post_args
        })
        : { requestHandler: null, data: null, disable: false };

    const [compVal, changeCompVal] = useState<ComponentProps<typeof OdinDoubleSlider>["value"]>([0, 100]);
    const metadata: MetadataValue | undefined = getValueFromPath(endpoint.metadata, isDoubleFullpath(fullpath) ? fullpath[0] : fullpath);
    const other_metadata: MetadataValue | undefined = isDoubleFullpath(fullpath) ? getValueFromPath(endpoint.metadata, fullpath[1]) : undefined;
    const compMin = min ?? metadata?.min ?? other_metadata?.min;
    const compMax = max ?? metadata?.max ?? other_metadata?.max;

    const component = useRef<HTMLDivElement>(null);

    const onChange: ComponentProps<typeof OdinDoubleSlider>["onChange"] = (event) => {
        const target = event.target;

        changeCompVal(target.value);
    }

    const onMouseUp: ComponentProps<typeof OdinDoubleSlider>['onMouseUp'] = (event) => {
        console.debug(event);
        if (isDoubleFullpath(fullpath)) {
            requestHandler(compVal?.[0]);
            other_requestHandler?.(compVal?.[1]);

        } else {
            requestHandler(compVal);
        }
    }

    useEffect(() => {
        if (isDoubleFullpath(fullpath)) {

            const newVal_min = getValueFromPath<number>(endpoint.data, fullpath[0]);
            const newVal_max = getValueFromPath<number>(endpoint.data, fullpath[1]);

            if (typeof newVal_min !== "undefined" && typeof newVal_max !== "undefined" && !component.current?.contains(document.activeElement)) {
                changeCompVal([newVal_min, newVal_max]);
            }
        } else {
            const newVal = getValueFromPath<number[]>(endpoint.data, fullpath);
            if (typeof newVal !== "undefined" && !component.current?.contains(document.activeElement)) {
                changeCompVal(newVal);
            }
        }
    }, [endpoint.data, fullpath, data, other_data]);



    return (
        <OdinDoubleSlider {...rest} ref={component} min={compMin} max={compMax} value={compVal}
            onChange={onChange} onMouseUp={onMouseUp} disabled={disable || other_disable} />
    )

}


export { EndpointDoubleSlider };