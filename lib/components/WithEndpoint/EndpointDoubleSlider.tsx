import { type EndpointProps, useRequestHandler } from "./util";

import { OdinDoubleSlider } from "../OdinDoubleSlider";
import { ComponentProps, useRef, useState, useEffect } from "react";
import { getValueFromPath } from "../AdapterEndpoint";

type EndpointDoubleSliderProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    Omit<EndpointProps<PreArgs, PostArgs>, "value"> & ComponentProps<typeof OdinDoubleSlider>;


const EndpointDoubleSlider = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest}: EndpointDoubleSliderProps<PreArgs, PostArgs>
    ) => {

        const {requestHandler, data, disable}  = useRequestHandler({
            endpoint, fullpath, value, disabled,
            pre_method, pre_args, post_method, post_args
        });

        const [compVal, changeCompVal] = useState<ComponentProps<typeof OdinDoubleSlider>["value"]>([0, 100]);
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
            if(typeof newVal !== "undefined" && !component.current?.contains(document.activeElement)){
                changeCompVal(newVal);
            }
        }, [endpoint.updateFlag, data]);



        return (
            <OdinDoubleSlider ref={component} min={min} max={max} value={compVal} 
                onChange={onChange} onMouseUp={onMouseUp} disabled={disable} {...rest}/>
        )

    }

    export {EndpointDoubleSlider};