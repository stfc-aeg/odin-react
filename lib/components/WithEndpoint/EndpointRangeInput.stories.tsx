import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointMultipliedInput } from './EndpointRangeInput';
import { useAdapterEndpoint, resetMockData, transformMockCode } from '../AdapterEndpoint/index.mock';
import { expect, spyOn } from 'storybook/test';

const meta = {
  component: EndpointMultipliedInput,
  args: {
    endpoint: undefined,
    fullpath: "volt",
    ranges: { "mV": 1, "V": 1e3, "μV": 1e-3 }
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
      description: "Unused, will always read from Adapter instead to display Parameter"
    }
  },
  parameters: {
    docs: {
      source: {
        transform: transformMockCode,
        language: "tsx"
      }
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <EndpointMultipliedInput {...args} />
  },
  beforeEach: async () => {
    resetMockData();
  },

} satisfies Meta<typeof EndpointMultipliedInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Standard use, with Voltage options as a demonstration */
export const Default: Story = {
  args: {
    step: 10
  }
};


/** Can also be used with non-decimal ranges, such as seconds/minutes */
export const Time: Story = {
  args: {
    ranges: {"Minutes": 60000, "s": 1000, "ms": 1},
    fullpath: "data/set_data",
    title: "Time"
  }
}