import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, spyOn, waitFor } from 'storybook/test';
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
        readonly: true,
        
      },
      
    },
    fullpath: {
      table: {
        type: {
          summary: "string | [string, string]",
          detail: "Typescript can validate the path(s) based on the AdapterEndpoint's Tree"
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

/** Standard Double Slider. Connects to single Parameter, which should be an array of 2 values */
export const Default: Story = {
  args: {
    title: "Default",
    min: -25,
    max: 25
  }
};

/** Slider with two separate paths to Parameters. It is assumed the first path shows the smaller of two values */
export const TwoPaths: Story = {
  args: {
    title: "Separate Parameters",
    fullpath: ["double/min", "double/max"]
  }
}
