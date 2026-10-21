import { useRef, useTransition } from 'react';
import type { FormControlProps } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { getValueFromPath } from "../AdapterEndpoint";
import type { ParamNode, ParamTree, ParamPath, AdapterEndpoint } from '../AdapterEndpoint';
import type { MetadataValue } from '../AdapterEndpoint/AdapterEndpoint.types';
import { useError } from "../OdinErrorContext";
import { ArgType, type EndpointProps } from '../WithEndpoint/util';


interface UploadProps<
    PreArgs extends ArgType,
    PostArgs extends ArgType,
    Tree extends Record<Extract<keyof Tree, string>, ParamTree>>
    extends Omit<EndpointProps<PreArgs, PostArgs, Tree>, "pre_method"> {

    pre_method?: (args: PreArgs) => void | FileList;
}

type EndpointUploadProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    UploadProps<PreArgs, PostArgs, Tree> & Omit<FormControlProps, keyof EndpointProps<PreArgs, PostArgs, Tree> | "type">;

interface ArgWithValue extends ArgType {
    value: unknown;
}
const ArgsHasValue = (x: ArgType): x is ArgWithValue => {
    return Object.keys(x).includes("value");
}


async function sendRequest<Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    files: FileList | null,
    endpoint: AdapterEndpoint<Tree>,
    path: ParamPath<Tree>
): Promise<ParamNode> {
    const formData = new FormData();
    if (files) {
        for (const file of files) {
            formData.append("file", file);
        }
    }
    try {
        const response = await endpoint.post(formData, path, "multipart/form-data");
        return response;
    } catch (err) {
        console.debug("Error in POST occured in File Upload component", err);
        return { "error": "POST Failed" }
    }
}

/**
 * Specialised Input component designed to upload files using the Endpoint POST method.
 * Unable to use the standard RequestHandler methods used by other Endpoint components since this uses the POST method, not the PUT method,
 * but much of the logic can be replicated.
 */
const FileUpload = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
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
        console.debug(event);
        try {
            const files = event.target.files;
            startTransition(async () => {
                if (pre_args && ArgsHasValue(pre_args)) {
                    if (pre_args.value === undefined || pre_args.value === null) {
                        pre_args.value = files;
                    }
                }
                const modFiles = pre_method?.(pre_args as PreArgs);

                sendRequest(modFiles ?? files, endpoint, fullpath)
                    .then((value) => {
                        if (post_args && ArgsHasValue(post_args)) {
                            if (post_args.value === undefined || post_args.value == null) {
                                if (Object.keys(value).length == 1) {
                                    // either Odin 1.6 with any number params, or 2.0 with single
                                    post_args.value = value[Object.keys(value)[0]]
                                } else {
                                    // Odin 2.0, multiple params. Set full dict as value
                                    post_args.value = value;
                                }
                            }
                            post_method?.(post_args as PostArgs);
                        }
                    });
            })
        } catch (err) {
            setError(err instanceof Error ? err: Error("Unknown Error Occured"));
        }
    }

    return (
        <Form.Control ref={component} type="file" disabled={disable} onChange={onChangeHandler} {...rest} />
    )

}

export { FileUpload };
