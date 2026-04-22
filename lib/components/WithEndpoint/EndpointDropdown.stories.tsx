import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointDropdown } from './EndpointDropdown';
import { Dropdown } from 'react-bootstrap';
import { useAdapterEndpoint, resetMockData, transformMockCode } from '../AdapterEndpoint/index.mock';


const meta = {
  component: EndpointDropdown,
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
      <EndpointDropdown {...args} />
    )
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default appearance and use of the EndpointDropdown. Automatically
 * gets the dropdown options if the Parameter linked to has an "allowed_values"
 * property in its metadata.
 */
export const Default: Story = {
  args: {},
};

/**
 * Custom Dropdown Items can be used for more control over the appearance,
 * or if the Parameter does not have the "allowed_values" metadata in its
 * properties.
 */
export const ManualList: Story = {
  args: {
    title: "Select Item",
    fullpath: "float_val",
    children: [
      <Dropdown.Item eventKey={12.4} key={0}>
        Set: 12.4
      </Dropdown.Item>,
      <Dropdown.Item eventKey={18} key={0}>
        Set: 18
      </Dropdown.Item>,
      <Dropdown.Divider />,
      <Dropdown.Item eventKey={-42} key={0}>
        Set Negative
      </Dropdown.Item>
    ]
  }
}