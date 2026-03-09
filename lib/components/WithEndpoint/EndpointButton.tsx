import type { ButtonProps } from "react-bootstrap";
import type { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { Button } from "react-bootstrap";
import { getValueFromPath } from "../AdapterEndpoint";

import { sendRequest } from "./util";
import type { EndpointProps } from "./util";
import { useTransition } from "react";


type EndpointButtonProps<PreArgs extends unknown[], PostArgs extends unknown[]> = 
    EndpointProps<PreArgs, PostArgs> & Omit<ButtonProps, keyof EndpointProps<PreArgs, PostArgs>>;



const EndpointButton = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled,
        pre_method, pre_args,
        post_method, post_args,
        ...rest }: EndpointButtonProps<PreArgs, PostArgs>
) => {
    const compVal = value ?? getValueFromPath(endpoint.data, fullpath);
    const metaData: MetadataValue = getValueFromPath<MetadataValue>(endpoint.metadata, fullpath)
                                        ?? {value: compVal, type: "int", writeable: true};

    const [isPending, startPendingTransition] = useTransition();
    
    const disable = disabled || isPending || endpoint.loading || !(metaData.writeable ?? true);

    const requestHandler = () => {
        startPendingTransition(async () => {
            
            
            pre_method?.(...(pre_args ?? []) as PreArgs);
        

            sendRequest(compVal, endpoint, fullpath)
            .then(() => {
                
                post_method?.(...(post_args ?? []) as PostArgs);
                
            });
        })
    }
    
    const onClickHandler = (event: React.MouseEvent) => {
        console.debug(fullpath, event);

        requestHandler();
    }

    return (
        <Button onClick={onClickHandler} {...rest} disabled={disable}>
            {rest.children}
        </Button>
    )
}

export { EndpointButton };
