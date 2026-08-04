import type { DropdownButtonProps } from "react-bootstrap";
import { Dropdown, DropdownButton } from "react-bootstrap";
import type { ArgType, EndpointProps } from "./util";
import { useRequestHandler } from "./util";
import { getValueFromPath } from "../AdapterEndpoint";
import { MetadataValue, ParamTree } from "../AdapterEndpoint/AdapterEndpoint.types";

type EndpointDropdownProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    EndpointProps<PreArgs, PostArgs, Tree> & Partial<DropdownButtonProps>;


/**
 * Specialised Dropdown component designed to PUT the selected value to the
 * parameter on a Param Tree.
 * 
 * Can automatically get the possible options if not supplied, and the metadata
 * has the allowed_values property set.
 * 
 * Based on the [Bootstrap DropdownButton](https://react-bootstrap.netlify.app/docs/components/dropdowns),
 * so any props on that component can also be set here.
 */
const EndpointDropdown = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        title, ...rest }: EndpointDropdownProps<PreArgs, PostArgs, Tree>
) => {

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const metadata: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);

    const onSelectHandler: DropdownButtonProps["onSelect"] = (eventKey, event) => {
        console.debug(fullpath, event, eventKey);

        requestHandler(eventKey);
    }

    return (
        <DropdownButton title={title ?? data as string} onSelect={onSelectHandler} disabled={disable} {...rest}>
            {rest.children ?? metadata?.allowed_values?.map(
                (selection, index) => (
                    <Dropdown.Item eventKey={selection as string} key={index} active={data == selection}>
                        {selection as string}
                    </Dropdown.Item>
                )
            )}
        </DropdownButton>
    )
}

export { EndpointDropdown };