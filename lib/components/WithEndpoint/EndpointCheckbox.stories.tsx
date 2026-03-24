import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointCheckbox } from './EndpointCheckbox';
import { useAdapterEndpoint } from '../AdapterEndpoint';
import { Form } from 'react-bootstrap';

const meta = {
  component: EndpointCheckbox,
  args: {
    endpoint: undefined,
    fullpath: "toggle",
    label: "Test Checkbox",
    type: "checkbox"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    type: {
        options: ["checkbox", "radio", "switch"],
        control: {type: "radio"}
      }
  },
  render: (args) => {
    const endpoint_use = useAdapterEndpoint("test", "http://localhost:1338");
    const { endpoint, ...rest } = args;
    return <EndpointCheckbox endpoint={endpoint_use} {...rest}/>
  }
} satisfies Meta<typeof EndpointCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};

export const RadioSelect: Story = {
  args: {
    type: "radio",
    fullpath: "selected"
  },
  render: (args) => {
    const endpoint_use = useAdapterEndpoint("test", "http://localhost:1338");
    const { endpoint, ...rest } = args;
    return (
      <Form>
        <EndpointCheckbox endpoint={endpoint_use} {...rest}
          name='radio-group' value="item 1" label="Item One"/>
        <EndpointCheckbox endpoint={endpoint_use} {...rest}
          name='radio-group' value="item 2" label="Item Two"/>
        <EndpointCheckbox endpoint={endpoint_use} {...rest}
          name='radio-group' value="item 3" label="Item Three"/>
      </Form>
    )
  }
}