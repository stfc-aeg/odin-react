import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinLiveView, ZoomableImage } from './index';
import { transformMockCode } from '../AdapterEndpoint/index.mock';
import { useAdapterEndpoint_LiveView, userAdapterEndpoint_LiveView_noControls } from '../AdapterEndpoint/index.mock';

const meta = {
  component: OdinLiveView,
  subcomponents: { ZoomableImage },
  args: {
    endpoint: undefined
  },
  argTypes: {
    endpoint: {
      control: {
        disable: true
      }
    },
    interval: {
      description: "How Often to request a new image from the Adapter"
    }
  },
  parameters: {
    docs: {
      source: {
        transform: (source: string) => transformMockCode(source, undefined, "live"),
        language: "tsx"
      }
    }
  },
  render: (args) => {
    const endpoint = useAdapterEndpoint_LiveView("live", "http://localhost:1338");
    args.endpoint = endpoint;
    return <OdinLiveView {...args} />
  }
} satisfies Meta<typeof OdinLiveView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**Standard rendering of the Live View.
 * Shows controls in a popover menu within the header
 * and zoom buttons in a hover overlay*/
export const Default: Story = {
  args: {}
};

/**Standalone image version of the Live View. Note that in this mode, the Title is not rendered,
 * and any Live View controls are part of the Hover Overlay, alongside the zoom controls
 */
export const JustImage: Story = {
  args: {
    justImage: true
  }
}

/**
 * The Component will not display the controls dropdown button if the adapter does
 * not provide them as parameters
 */
export const NoControls: Story = {
  args: {
    title: "No Controls"
  },
  render: (args) => {
    const endpoint = userAdapterEndpoint_LiveView_noControls("live_No_Controls", "http://localhost:1338");
    args.endpoint = endpoint as typeof args.endpoint;
    return <OdinLiveView {...args} />
  }
}