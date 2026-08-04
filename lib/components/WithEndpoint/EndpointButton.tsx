import type { ButtonProps } from "react-bootstrap";
import { Button } from "react-bootstrap";

import type { ParamTree } from '../AdapterEndpoint';
import type { EndpointProps, ArgType } from "./util";
import { useRequestHandler } from "./util";

type EndpointButtonProps
    <
        PreArgs extends ArgType,
        PostArgs extends ArgType,
        Tree extends Record<Extract<keyof Tree, string>, ParamTree>

    > = EndpointProps<PreArgs, PostArgs, Tree> & Omit<ButtonProps, keyof EndpointProps<PreArgs, PostArgs, Tree>>;



/**
 * Specialised Button component designed to work with an Adapter Endpoint,
 * doing a PUT request whenever clicked. Uses the value read from the adapter
 * unless the Value Prop is set.
 * 
 * Based on the [Bootstrap Button](https://react-bootstrap.netlify.app/docs/components/buttons),
 * so all props available on that component can be set here.
 * 
 * PUTs the value prop if supplied, otherwise PUTs whatever the parameter is
 * on the Tree.
 */
const EndpointButton = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointButtonProps<PreArgs, PostArgs, Tree>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const onClickHandler: ButtonProps["onClick"] = (event) => {
        console.debug(fullpath, event);

        requestHandler(data);
    }

    return (
        <Button {...rest} onClick={onClickHandler} disabled={disable}>
            {rest.children}
        </Button>
    )
}

export { EndpointButton };
