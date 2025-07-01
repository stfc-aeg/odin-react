import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { http, HttpResponse, delay } from 'msw';


import { OdinLiveView } from './index';
import { AdapterEndpoint_t } from '../../main';

const endpointData_standard = {
  frame: {
      frame_num: 12
  },
  colormap_options: {"test": "Test", "blue": "Blue"},
  colormap_selected: "test",
  data_min_max: [0, 1024],
  clip_range: [0, 1024]

}

const MockEndpoint: AdapterEndpoint_t = {
  data: endpointData_standard,
  metadata: {},
  error: null,
  loading: false,
  updateFlag: Symbol("mocked"),
  get: fn(),
  put: fn(),
  post: fn(),
  remove: fn(),
  refreshData: fn(),
  mergeData: fn()
}

const meta = {
  component: OdinLiveView,
  decorators: [(story) => <div style={{ margin: '1rem 10rem' }}>{story()}</div>],
  argTypes: {
    endpoint: {
      options: ["Standard", "No Controls", "Custom Control Addrs"],
      mapping: {
        Standard: MockEndpoint,
        "No Controls": MockEndpoint,
        "Custom Control Addrs": MockEndpoint
      },
      control: {type: "radio"}
    }
  },
  args: {
    endpoint: "Standard"
  }
} satisfies Meta<typeof OdinLiveView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("https")
      ]
    }
  }
};