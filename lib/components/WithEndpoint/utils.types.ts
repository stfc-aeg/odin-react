import type { AdapterEndpoint, ParamNode, ParamTree, ParamPath } from "../AdapterEndpoint";

export type ArgType = Record<string, unknown>;

/**
 * Basic Properties common to every Endpoint component
 * 
 * @template Tree The shape of the Parameter Tree of the provided Endpoint
 */
interface BasicEndpointProps<Tree extends Record<Extract<keyof Tree, string>, ParamTree>> {
    /** Endpoint to connect to */
    endpoint: AdapterEndpoint<Tree>;
    /** Path to the Parameter(s) to control with this component */
    fullpath: ParamPath<Tree>;
    /** Optional value to override the value read from the adapter*/
    value?: ParamTree;
    /** Disable the component, so it cannot be interacted with*/
    disabled?: boolean;
}

// export type EndpointProps<PreArgs extends ArgType, PostArgs extends ArgType> =
//     (PreMethodNoArgs | PreMethodWithArgs<NonNullable<PreArgs>>) &
//     (PostMethodNoArgs | PostMethodWithArgs<NonNullable<PostArgs>>)

/**
 * Properties common to every Endpoint component, including optional pre/post methods and args
 * 
 * @template PreArgs The inferred kwarg dictionary object of arguments to pass to
 * the pre_method, if the function exists and has arguments.
 * 
 * @template PostArgs The inferred kwarg dictionary object of arguments to pass to
 * the post_method, if the function exists and has arguments
 * 
 * @template Tree The shape of the Parameter Tree of the provided Endpoint
 */
export interface EndpointProps<
    PreArgs extends ArgType,
    PostArgs extends ArgType,
    Tree extends Record<Extract<keyof Tree, string>, ParamTree>>
    extends BasicEndpointProps<Tree> {
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
    pre_args?: NoInfer<PreArgs>;
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
    post_args?: NoInfer<PostArgs>;
}
