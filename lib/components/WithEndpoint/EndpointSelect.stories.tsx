import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointSelect } from './EndpointSelect';
import { useAdapterEndpoint, resetMockData, transformMockCode } from '../AdapterEndpoint/index.mock';

const meta = {
  component: EndpointSelect,
  args: {
    endpoint: undefined,
    fullpath: "selected",
    children: undefined
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    fullpath: {
      table: {
        type: {
          summary: "string",
          detail: "Typescript can validate the path based on the AdapterEndpoint's Tree"
        }
      }
    },
    children: {
      table: {
        disable: true
      }
    }
  },
  parameters: {
    layout: "centered",
    docs: {
      source: {
        transform: transformMockCode,
        language: "tsx"
      }
    }
  },
  render: (args) => {
    const endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    args.endpoint = endpoint;
    return (
      <EndpointSelect {...args} />
    )
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointSelect>;

export default meta;

type Story = StoryObj<typeof meta>;


/**
 * Default appearance and use of the EndpointSelect. Automatically gets the options if the 
 * Parameter linked to has an "allowed_values" property in it's metadata
 */
export const Default: Story = {
  args: { },
  
};

/**
 * Options can be manually applied for better control over labels,
 * or if the Parameter used does not have the "allowed_values" metadata property
 */
export const ManualList: Story = {
  args: {
    fullpath: "float_val",
    children: [
      <option value={4.5}>Four and a Half</option>,
      <option value={6.2}>6.2</option>,
      <option value={-42}>Negative 42</option>
    ]
  }
}