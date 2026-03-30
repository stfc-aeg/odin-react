import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointInput } from './EndpointInput';
import { useAdapterEndpoint, resetMockData } from '../AdapterEndpoint/index.mock';
import { expect, spyOn } from 'storybook/test';

const meta = {
  component: EndpointInput,
  args: {
    endpoint: undefined,
    fullpath: "string_val"
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
      description: "Unused for Textbox, will always read from Adapter instead to display Parameter"
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <EndpointInput {...args} />
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ args, canvas, userEvent }) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const input = canvas.getByRole("textbox");

    await expect(input).toHaveDisplayValue(args.endpoint.data.string_val as string);

    await userEvent.clear(input);
    await userEvent.type(input, "New Value");
    await expect(put).not.toHaveBeenCalled();
    await userEvent.keyboard("[Enter]");
    await expect(put).toHaveBeenCalledWith({ value: "New Value" }, "string_val");

    await userEvent.clear(input);
    await userEvent.type(input, "52");
    await expect(put).not.toHaveBeenCalledWith({ value: "52" }, "string_val");
    await userEvent.keyboard("[Enter]");
    await expect(put).toHaveBeenCalledWith({ value: "52" }, "string_val");
  }
};

export const Number: Story = {
  args: {
    fullpath: "num_val"
  },
  play: async ({ args, canvas, userEvent }) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const input = canvas.getByRole("spinbutton");

    await expect(input).toHaveDisplayValue(args.endpoint.data.num_val as string);

    await userEvent.clear(input);
    await userEvent.type(input, "52");
    await expect(put).not.toHaveBeenCalled();
    await userEvent.keyboard("[Enter]");

    await expect(put).toHaveBeenCalledWith({ value: 52 }, "num_val");
  }
}

export const ReadOnly: Story = {
  args: {
    fullpath: "rand_num"
  },
  play: async ({ canvas }) => {
    //spinbutton cause number input
    await expect(canvas.getByRole("spinbutton")).toBeDisabled();
  }
}