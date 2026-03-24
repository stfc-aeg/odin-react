import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointButton } from './EndpointButton';
import { useAdapterEndpoint } from '../AdapterEndpoint';
import { fn } from 'storybook/test';


const meta = {
  component: EndpointButton,
  args: {
    endpoint: undefined,
    fullpath: "trigger",
    children: "Test Button"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    value: {
      table: {
        type: {
          summary: "ParamTree",
          detail: "String, Number, Boolean, null/undefined, or an array or dict of those values"
        }
      }
    }
  },
  render: (args) => {
    const endpoint_use = useAdapterEndpoint("test", "http://localhost:1338");
    const { endpoint, ...rest } = args;
    return <EndpointButton endpoint={endpoint_use} {...rest} />
  }
} satisfies Meta<typeof EndpointButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    
  },
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
}

export const PreTrigger: Story = {
  args: {
    pre_method: fn()
  }
}