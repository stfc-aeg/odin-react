# WithEndpoint

This hook allows for the creation of interactable GUI elements (such as buttons) to automatically connect to an Odin Control endpoint. It can handle events automatically to send specified data (as a PUT request) to that specified adapter, to a specific path.

Use of this hook creates a new, custom element that can then be used multiple times as required, with different endpoints and paths for each iteration if required.

Because the hook creates an element, the properties listed below should be passed to the instance of the element, rather than to the initial hook. Additional props for the internal element can also be provided, this hook will pass on the properties to the element it is wrapping.

## Properties

- ### endpoint (AdapterEndpoint)
    An Adapter Endpoint object (see AdapterEndpoint.md) that the object should be connected to
- ### fullpath (string)
    The path within the Adapter to the specific parameter to be modified by the event.
- ### value (any)
    The value to send. This property is not always used, depending on the type of event that occurs.
- ### type (string)
    Either `"select"`, `"click"`, or `"change"`. The type of event that will trigger a PUT request. A `"select"` event would be triggered by a dropdown menu, for instance. A `"click"` event can be used for buttons and other clickable objects. A `"change"` event would be used for monitoring text input changes, or other such inputs.
- ### disabled (bool)
    If provided, this will disable the component if `true`. The component will also be disabled if the `endpoint` used is currently sending a value to the adapater.
- ### delay (integer)
    The delay in milliseconds, specifically for the `"change"` event, between the last change to the value and sending it to the Adapter. This was introduced so that text inputs and similar would not cause a PUT request with every character entered, but only when the user was done entering the value.
- ### pre_method (function)
    A function to be called prior to PUT request to the adapter endpoint.
- ### pre_args (list)
    A list of arguments to be passed to the `pre_method`
- ### post_method (function)
    A function to be called once the PUT request has received a response from the adapter. This will not run if the PUT request results in an error.
- ### post_args (list)
    A list of arguments to be passed to the `post_method`

## Example

```jsx
const EndpointButton = WithEndpoint(Button);

...

<EndpointButton endpoint={exampleEndpoint} type="click" fullpath="test" value={42}>
    Trigger
</EndpointButton>
```