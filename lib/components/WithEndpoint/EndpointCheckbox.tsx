import type { FormCheckProps } from "react-bootstrap";
import { FormCheck } from "react-bootstrap";

import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";

type EndpointCheckboxProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<FormCheckProps, keyof EndpointProps<PreArgs, PostArgs>>;


const EndpointCheckbox = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointCheckboxProps<PreArgs, PostArgs>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value: undefined, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const checked = typeof value !== "undefined" ? value == data : Boolean(data);


    const onChangeHandler: FormCheckProps["onChange"] = (event) => {
        console.debug(fullpath, event);
        
        const target = event.target;
        const checked = target.checked;

        requestHandler(value ?? checked);
    }


    return (
        <FormCheck onChange={onChangeHandler} {...rest} disabled={disable} checked={checked}>
            {rest.children}
        </FormCheck>
    )
}

export { EndpointCheckbox };
