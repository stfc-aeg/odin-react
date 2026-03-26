import type { ButtonProps } from "react-bootstrap";
import { Button } from "react-bootstrap";

import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";

type EndpointButtonProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<ButtonProps, keyof EndpointProps<PreArgs, PostArgs>>;



/**
 * Specialised Button component designed to perform PUT requests to
 * a parameter in an Odin Control Adapter whenever clicked.
 * 
 * Based on the Bootstrap Button, so all props available on that component
 * can be set here. 
 */
const EndpointButton = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointButtonProps<PreArgs, PostArgs>
) => {
    
    const { requestHandler, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const onClickHandler: ButtonProps["onClick"] = (event) => {
        console.debug(fullpath, event);

        requestHandler(value);
    }

    return (
        <Button onClick={onClickHandler} {...rest} disabled={disable}>
            {rest.children}
        </Button>
    )
}

export { EndpointButton };
