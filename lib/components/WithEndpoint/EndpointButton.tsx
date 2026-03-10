import type { ButtonProps } from "react-bootstrap";
import { Button } from "react-bootstrap";

import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";

type EndpointButtonProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<ButtonProps, keyof EndpointProps<PreArgs, PostArgs>>;

const EndpointButton = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    props: EndpointButtonProps<PreArgs, PostArgs>
) => {
    const { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest } = props;


    const { requestHandler, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const onClickHandler = (event: React.MouseEvent) => {
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
