import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinLiveView, ZoomableImage } from './index';

import { MockEndpoint_standard, MockEndpoint_noControls, MockEndpoint_noFrame, MockEndpoint_noClip } from './stories.mock';


const meta = {
  component: OdinLiveView,
  subcomponents: {ZoomableImage},
  argTypes: {
    endpoint: {
      options: ["Standard", "No Controls", "No Frame Number", "No Clipping Controls", "Custom Control Addrs"],
      mapping: {
        "Standard": MockEndpoint_standard,
        "No Controls": MockEndpoint_noControls,
        "No Frame Number": MockEndpoint_noFrame,
        "No Clipping Controls": MockEndpoint_noClip
      },
      control: {type: "radio"}
    },
    title: {
      control: {type: "text"}
    }
  },
  args: {
    endpoint: "Standard"
  }
} satisfies Meta<typeof OdinLiveView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    endpoint: "Standard"
  }
};

export const NoControls: Story = {
  args: {
    endpoint: "No Controls"
  }
};

export const JustImage: Story = {
  args: {
    endpoint: "Standard",
    justImage: true
  }
};
