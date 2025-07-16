import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinLiveView } from './index';

import { MockEndpoint_standard, MockEndpoint_noControls } from './stories.mock';


const meta = {
  component: OdinLiveView,
  argTypes: {
    endpoint: {
      options: ["Standard", "No Controls", "Custom Control Addrs"],
      mapping: {
        Standard: MockEndpoint_standard,
        "No Controls": MockEndpoint_noControls,
        "Custom Control Addrs": MockEndpoint_standard
      },
      control: {type: "radio"}
    },
    justImage: {
      control: {type: "boolean"}
    },
    title: {
      control: {type: "text"}
    }
  },
  args: {
    endpoint: MockEndpoint_standard,
    justImage: false
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
