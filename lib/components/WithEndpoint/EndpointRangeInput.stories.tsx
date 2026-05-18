import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointRangeInput } from './EndpointRangeInput';
import { useAdapterEndpoint, resetMockData, transformMockCode } from '../AdapterEndpoint/index.mock';
import { expect, spyOn } from 'storybook/test';

const meta = {
  component: EndpointRangeInput,
  args: {
    endpoint: undefined,
    fullpath: "volt",
    ranges: { "mV": 1e-3, "V": 1, "μV": 1e-6 },
    defaultRange: "mV"
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
    return <EndpointRangeInput {...args} />
  },
  beforeEach: async () => {
    resetMockData();
  },

} satisfies Meta<typeof EndpointRangeInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Standard use, with Voltage options as a demonstration */
export const Default: Story = {
  args: {},
  play: async ({args, canvas, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const input = canvas.getByRole("spinbutton");
    const dropdown = canvas.getByRole("button");

    await userEvent.clear(input);
    await userEvent.type(input, "1600");

    await userEvent.keyboard("[Enter]");
    await expect(put).toHaveBeenCalledWith({value: 1600}, args.fullpath);

    await userEvent.click(dropdown);
    const VoltButton = canvas.getByText("V");

    await userEvent.click(VoltButton);

    await expect(input).toHaveDisplayValue("1.6");

    await userEvent.clear(input);
    await userEvent.type(input, "2");
    await userEvent.keyboard("[Enter]");

    await expect(put).toHaveBeenCalledWith({value: 2000}, args.fullpath);
  }
};


/** Can also be used with non-decimal ranges, such as seconds/minutes */
export const Time: Story = {
  args: {
    ranges: {"Minutes": 60, "s": 1, "ms": 1e-3},
    defaultRange: "ms",
    fullpath: "data/set_data",
    title: "Time"
  }
}