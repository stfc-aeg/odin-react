import { useRef, useTransition } from 'react';
import type { FormControlProps } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import type { AdapterEndpoint, ParamNode, ParamPath, ParamTree } from '../AdapterEndpoint';
import { getValueFromPath } from "../AdapterEndpoint";
import type { MetadataValue } from '../AdapterEndpoint/AdapterEndpoint.types';
import { useError } from "../OdinErrorContext";
import type { ArgType } from '../WithEndpoint/util';


interface UploadProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> {
    /** Endpoint to connect to */
    endpoint: AdapterEndpoint<Tree>;
    /** Path to the Parameter(s) to control with this component */
    fullpath: ParamPath<Tree>;
    /** Disable the component, so it cannot be interacted with*/
    disabled?: boolean;
    /** 
     * A method to run before the POST request. Accepts a Dictionary of
     * kwargs. If "value" is one of those keys, the File List will be
     * inserted into the dictionary.
     * 
     * The function can optionally return a File List that will be send to
     * Odin Control.
    */
    pre_method?: (args: PreArgs) => void | FileList;
    /** The Dictionary of kwargs to pass to pre_method. To pass the
     * param value to the method, include a "value" key with a value
     * that is Null or Undefined.
     */
    pre_args?: NoInfer<PreArgs>;
    /**
     * A method to run after the POST request succeeds. Accepts a Dictionary of
     * kwargs. If "value" is one of those keys, the returned param value will be
     * inserted into the dictionary.
    */
    post_method?: (args: PostArgs) => void;
    /** The Dictionary of kwargs to pass to post_method. To pass the
    * returned param value to the method, include a "value" key that is Null
    * or Undefined.
    */
    post_args?: NoInfer<PostArgs>;

}

type FileUploadProps<PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>> =
    UploadProps<PreArgs, PostArgs, Tree> & Omit<FormControlProps, "type">;

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
 * 
 * Allows for single or multiple file upload. The Adapter connected will need to handle POST requests with a Content Type of "multipart/form-data"
 */
const FileUpload = <PreArgs extends ArgType, PostArgs extends ArgType, Tree extends Record<Extract<keyof Tree, string>, ParamTree>>(
    { endpoint, fullpath, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: FileUploadProps<PreArgs, PostArgs, Tree>
) => {

    const [isPending, startTransition] = useTransition();
    const { setError } = useError();
    
    const metadata: MetadataValue = getValueFromPath(endpoint.metadata ?? {}, fullpath)
        ?? {
        value: null,
        type: "NoneType",
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
                const modFiles = pre_method?.(pre_args as PreArgs) as void | FileList;

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
            setError(err instanceof Error ? err : Error("Unknown Error Occured"));
        }
    }

    return (
        <Form.Control ref={component} type="file" disabled={disable} onChange={onChangeHandler} role='upload' {...rest} />
    )

}

export { FileUpload };
