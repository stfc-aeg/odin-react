# WithEndpoint

This hook allows for the creation of interactable GUI elements (such as buttons) to automatically connect to an Odin Control endpoint. It can handle events automatically to send specified data (as a PUT request) to that specified adapter, to a specific path.

Use of this hook creates a new, custom element that can then be used multiple times as required, with different endpoints and paths for each iteration if required.

Because the hook creates an element, the properties listed below should be passed to the instance of the element, rather than to the initial hook. Additional props for the internal element can also be provided, this hook will pass on the properties to the element it is wrapping.

## Properties

- endpoint (AdapterEndpoint)
    An Adapter Endpoint object (see AdapterEndpoint.md) that the object should be connected to
- fullpath (string)
    The path within the Adapter to the specific parameter to be modified by the event.
- value (any)
    The value to send. This property is not always used, depending on the type of event that occurs.
- type (string)
    Either `"select"`, `"click"`, or `"change"`. The type of event that will trigger a PUT request. A `"select"` event would be triggered by a dropdown menu, for instance. A `"click"` event can be used for buttons and other clickable objects. A `"change"` event would be used for monitoring text input changes, or other such inputs.

## Example

```jsx
const EndpointButton = WithEndpoint(Button);

...

<EndpointButton endpoint={exampleEndpoint} type="click" fullpath="test" value={42}>
    Click Here
</EndpointButton>
```