import { WithEndpoint } from ".";

import { Form, Button, DropdownButton } from "react-bootstrap";

const EndpointInput = WithEndpoint(Form.Control);
const EndpointButton = WithEndpoint(Button);
const EndpointDropdown = WithEndpoint(DropdownButton);
const EndpointCheckbox = WithEndpoint(Form.Check);


export {EndpointInput, EndpointButton, EndpointDropdown, EndpointCheckbox};