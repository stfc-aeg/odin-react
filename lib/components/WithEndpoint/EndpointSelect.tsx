import { ParamTree } from "odin-react";
import { ArgType, EndpointProps } from "./utils.types";
import type { FormSelectProps } from "react-bootstrap";
import { FormSelect } from "react-bootstrap";
import { useRequestHandler } from "./util";
import { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { getValueFromPath } from "../AdapterEndpoint";
import { useEffect, useRef } from "react";

type EndpointSelectProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    EndpointProps<PreArgs, PostArgs, Tree> & Omit<FormSelectProps, keyof EndpointProps<PreArgs, PostArgs, Tree>>;

/**
 * Specialised Select component designed to work with a Parameter on the Parameter Tree.
 * 
 * Can automatically get the possible options from the Metadata, if allowed_values are present.
 * 
 * Based on the [Bootstrap Form.Select](https://react-bootstrap.netlify.app/docs/forms/select) component,
 * so any props on that can be used here.
 * 
 * Differs from the EndpointDropdown component in that it does not render as a button, but as 
 * a form input element, to better fit within form layouts
 */
const EndpointSelect = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointSelectProps<PreArgs, PostArgs, Tree>

) => {

    const component = useRef<HTMLSelectElement>(null);

    const { requestHandler, data, disable } = useRequestHandler({
        endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args
    });

    const metadata: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);

    const onChangeHandler: FormSelectProps["onChange"] = (event) => {
        const val = event.target.value;
        requestHandler(val);

    }

    useEffect(() => {
        const newVal = getValueFromPath<FormSelectProps["value"]>(endpoint.data, fullpath);

        if(document.activeElement != component.current && typeof newVal !== "undefined") {
            if(component.current) {
                component.current.value = newVal.toString();
            }
        }
    }, [endpoint.data, fullpath, data]);

    return (
        <FormSelect ref={component} onChange={onChangeHandler} disabled={disable} {...rest}>
            {rest.children ?? metadata?.allowed_values?.map(
                (selection, index) => (
                    <option key={index}>
                        {selection as string}
                    </option>
                )
            )}
        </FormSelect>
    )
}

export { EndpointSelect }