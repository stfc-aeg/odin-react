import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointInput } from './EndpointInput';
import { useAdapterEndpoint } from '../AdapterEndpoint';

const meta = {
  component: EndpointInput,
  args: {
    endpoint: undefined,
    fullpath: "string_val"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    value: {
      table: {
        readonly: true
      },
      description: "Unused Value for Input, will always read from Adapter instead"
    }
  },
  render: (args) => {
    const endpoint_use = useAdapterEndpoint("test", "http://localhost:1338");
    const { endpoint, ...rest } = args;
    return <EndpointInput endpoint={endpoint_use} {...rest}/>
  }
} satisfies Meta<typeof EndpointInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};

export const Number: Story = {
  args: {
    fullpath: "num_val"
  }
}

export const ReadOnly: Story = {
  args: {
    fullpath: "rand_num"
  }
}