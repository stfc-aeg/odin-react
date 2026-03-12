import type { DropdownButtonProps } from "react-bootstrap";
import { DropdownButton } from "react-bootstrap";
import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";

type EndpointDropdownProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<DropdownButtonProps, keyof EndpointProps<PreArgs, PostArgs> | "title">
    & {title?: React.ReactNode}

const EndpointDropdown = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        title, ...rest }: EndpointDropdownProps<PreArgs, PostArgs>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });


    const onSelectHandler: DropdownButtonProps["onSelect"] = (eventKey, event) => {
        console.debug(fullpath, event, eventKey);

        requestHandler(eventKey);
    }

    return (
        <DropdownButton title={title ?? data as string} onSelect={onSelectHandler} disabled={disable} {...rest}>
            {rest.children}
        </DropdownButton>
    )
} 

export { EndpointDropdown };