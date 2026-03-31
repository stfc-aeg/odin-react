import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointDropdown } from './EndpointDropdown';
import { Dropdown } from 'react-bootstrap';
import { useAdapterEndpoint, resetMockData } from '../AdapterEndpoint/index.mock';
import { expect, spyOn } from 'storybook/test';


const meta = {
  component: EndpointDropdown,
  args: {
    endpoint: undefined,
    fullpath: "selected"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    }
  },
  render: (args) => {
    const endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    args.endpoint = endpoint;
    return (
      <EndpointDropdown {...args}>
        {endpoint.metadata.selected.allowed_values?.map(
          (selection, index) => (
            <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
          )
        )}
      </EndpointDropdown>
    )
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};