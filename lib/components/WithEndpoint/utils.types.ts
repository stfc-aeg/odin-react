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

// export type EndpointProps<PreArgs extends ArgType, PostArgs extends ArgType> =
//     (PreMethodNoArgs | PreMethodWithArgs<NonNullable<PreArgs>>) &
//     (PostMethodNoArgs | PostMethodWithArgs<NonNullable<PostArgs>>)

export interface EndpointProps<PreArgs extends ArgType, PostArgs extends ArgType>
    extends BasicEndpointProps {
    /** 
     * A method to run before the PUT request. Accepts a Dictionary of
     * kwargs. If "value" is one of those keys, the param value will be
     * inserted into the dictionary.
     * 
     * The function can optionally return a value that will be send to
     * Odin Control.
    */
    pre_method?: (args: PreArgs) => void | ParamTree;
    /** The Dictionary of kwargs to pass to pre_method. To pass the
     * param value to the method, include a "value" key with a value
     * that is Null or Undefined.
     */
    pre_args?: PreArgs;
    /**
     * A method to run after the PUT request succeeds. Accepts a Dictionary of
     * kwargs. If "value" is one of those keys, the returned param value will be
     * inserted into the dictionary.
    */
    post_method?: (args: PostArgs) => void;
    /** The Dictionary of kwargs to pass to post_method. To pass the
    * returned param value to the method, include a "value" key that is Null
    * or Undefined.
    */
    post_args?: PostArgs;
}
