import type { FormCheckProps } from "react-bootstrap";
import { FormCheck } from "react-bootstrap";

import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";

import style from './styles.module.css'

type EndpointCheckboxProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<FormCheckProps, keyof EndpointProps<PreArgs, PostArgs>>;


/** 
 * Specialised Checkbox component designed to work with an Adapter Endpoint
 * to set a Parameter whenever clicked. Can be used to either toggle a boolean
 * value, or PUT the value supplied as a prop. This is useful if used as 
 * a set of Radio select buttons.
 * 
 * Based on the [Bootstrap FormCheck](https://react-bootstrap.netlify.app/docs/forms/checks-radios),
 * so all props available on that component can be set here.
 */
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
        <FormCheck className={style.endpointCheckbox} {...rest} onChange={onChangeHandler}  disabled={disable} checked={checked}>
            {rest.children}
        </FormCheck>
    )
}

export { EndpointCheckbox };
