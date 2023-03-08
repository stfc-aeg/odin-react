# useAdapterEndpoint.md

A *React hook* designed to connect to an Odin Control Endpoint or adapter.

Usage allows for GET and PUT requests to be automated, as well as periodic GET calls for adapters that have constantly updating data that needs to be reflected in the GUI.

This hook maintains a local copy of the data it gets from the adapter, which can then be displayed in the GUI elements. When done this way, any data displayed will automatically update if and when the local copy within the hook updates (be this either automatically when the periodic value is set, or when the GET method is called)

This hook was designed with the intention of connecting to a single adapter. Therefore, if multiple adapters exist in a system that should be connected to, please use one hook per adapter.

## Properties
- ### adapter (string)
    the name of the adapter within the Odin Control Instance that this endpoint should connect to
- ### endpoint_url (url string)
    The URL of the Odin Control Instance, including IP and port address.
    eg `http://192.168.0.1:1234`
- ### api_version (string)
    The API version, which is appended to the start of the adapter path. This defaults to `'0.1'` and likely will not need to change.
- ### interval (integer)
    Defaults to `null`. If set to a number of milliseconds, the AdapterEndpoint will periodically send a GET request to the adapter with that frequency, to update its local copy of the data.

## Example

```jsx
// Creates an endpoint that will send a GET request to the follwing path once a second:
// http://localhost:8888/api/0.1/adapter
const exampleEndpoint = useAdapterEndpoint("adapter", "http://localhost:8888", {interval: 1000});

```