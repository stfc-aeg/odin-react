import type { Meta, StoryObj } from '@storybook/react-vite';
import { resetMockData, useAdapterEndpoint, transformMockCode } from '../AdapterEndpoint/index.mock';

import { EndpointDoubleSlider } from './EndpointDoubleSlider';

const meta = {
  component: EndpointDoubleSlider,
  args: {
    endpoint: undefined,
    fullpath: "data/clip_data"
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
    onChange: {
      table: {
        disable: true
      }
    },
    onMouseUp: {
      table: {
        disable: true
      }
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
    return (<EndpointDoubleSlider {...args} />)
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointDoubleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};