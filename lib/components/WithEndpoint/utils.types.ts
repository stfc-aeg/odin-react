import type { AdapterEndpoint, ParamTree } from "../AdapterEndpoint";

export type ArgType = Record<string, unknown> | undefined;

interface BasicEndpointProps {
    /** Endpoint to connect to */
    endpoint: AdapterEndpoint;
    /** Path to the Parameter(s) to control with this component */
    fullpath: string;
    /** Optional value to override the value read from the adapter*/
    value?: ParamTree;
    /** Disable the component, so it cannot be interacted with*/
    disabled?: boolean;
}

interface PreMethodWithArgs<Args extends ArgType> extends BasicEndpointProps {
    pre_method: (args: Args) => void;
    pre_args: Args;
}

interface PreMethodNoArgs extends BasicEndpointProps {
    pre_method?: () => void;
    pre_args?: undefined;
}

interface PostMethodWithArgs<Args extends ArgType> extends BasicEndpointProps {
    post_method: (args: Args) => void;
    post_args: Args;
}

interface PostMethodNoArgs extends BasicEndpointProps {
    post_method?: () => void;
    post_args?: undefined;
}

// export type EndpointProps<PreArgs extends ArgType, PostArgs extends ArgType> =
//     (PreMethodNoArgs | PreMethodWithArgs<NonNullable<PreArgs>>) &
//     (PostMethodNoArgs | PostMethodWithArgs<NonNullable<PostArgs>>)

export interface EndpointProps<PreArgs extends ArgType, PostArgs extends ArgType>
    extends BasicEndpointProps {
        pre_method?: (args: PreArgs) => void;
        pre_args?: PreArgs;
        post_method?: (args: PostArgs) => void;
        post_args?: PostArgs;
    }
