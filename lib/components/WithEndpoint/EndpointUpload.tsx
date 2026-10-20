import { useRef, useTransition } from 'react';
import type { FormControlProps } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { getValueFromPath } from "../AdapterEndpoint";
import type { MetadataValue, ParamNode, ParamTree, ParamPath } from '../AdapterEndpoint/AdapterEndpoint.types';
import { useError } from "../OdinErrorContext";
import { ArgType, type EndpointProps } from './util';


type EndpointUploadProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    EndpointProps<PreArgs, PostArgs, Tree> & Omit<FormControlProps, keyof EndpointProps<PreArgs, PostArgs, Tree> | "type">;

interface ArgWithValue extends ArgType {
    value: unknown;
}
const ArgsHasValue = (x: ArgType): x is ArgWithValue => {
    return Object.keys(x).includes("value");
}

/**
 * Specialised Input component designed to upload files using the Endpoint POST method.
 * Unable to use the standard RequestHandler methods used by other Endpoint components since this uses the POST method, not the PUT method,
 * but much of the logic can be replicated.
 */
const EndpointUpload = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointUploadProps<PreArgs, PostArgs, Tree>
) => {

    const [isPending, startTransition] = useTransition();
    const { setError } = useError();
    const data: ParamTree = value ?? getValueFromPath(endpoint.data ?? {}, fullpath);
    const metadata: MetadataValue = getValueFromPath(endpoint.metadata ?? {}, fullpath)
        ?? {
        value: data,
        type: typeof data == "number" ? "int" : "str",
        writeable: true
    };

    const disable = disabled || isPending || endpoint.loading || !(metadata.writeable ?? true);

    const component = useRef<HTMLInputElement>(null);

    const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        console.log(event);
        console.log("Setting Content Type")
        const target = event.target;
        const files = target.files;
        if (files) {
            // multipart form
            const formData = new FormData();
            for (const file of files) {
                formData.append("file", file);
            }
            endpoint.post<FormData>(formData, fullpath, "multipart/form-data").then((response) => {
                console.log("POST Response: ", response);
            });
        }
    }

    return (
        <Form.Control ref={component} type="file" disabled={disable} onChange={onChangeHandler} {...rest} />
    )

}

export { EndpointUpload }