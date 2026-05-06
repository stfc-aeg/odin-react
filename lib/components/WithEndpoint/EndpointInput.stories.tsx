import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointInput } from './EndpointInput';
import { useAdapterEndpoint, resetMockData, transformMockCode } from '../AdapterEndpoint/index.mock';
import { expect, spyOn, fn } from 'storybook/test';

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

const preCapMethod = ({value}: {value?: string}) => {
  console.log(`Pre Func called with ${value}`);
  return value?.toUpperCase();
}

/** We can manipulate the sent string/number value with the pre_method */
export const PreCapitalise: Story = {
  args: {
    pre_method: fn(preCapMethod),
    pre_args: {value: undefined}
  },
  play: async({args, canvas, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const input = canvas.getByRole("textbox");
    const put_string = "new value";

    await expect(input).toHaveDisplayValue(args.endpoint.data.string_val as string);

    await userEvent.clear(input);
    await userEvent.type(input, put_string);

    await expect(put).not.toHaveBeenCalled();
    await userEvent.keyboard("[Enter]");

    await expect(args.pre_method).toHaveBeenCalledWith({value: put_string});
    await expect(put).toHaveBeenCalledWith({"value": put_string.toUpperCase()}, args.fullpath);
    await expect(input).toHaveDisplayValue(put_string.toUpperCase());


  }
}

/** Input will be readonly if the parameter is not writeable */
export const ReadOnly: Story = {
  args: {
    fullpath: "rand_num"
  },
  play: async ({ canvas }) => {
    //spinbutton cause number input
    await expect(canvas.getByRole("spinbutton")).toBeDisabled();
  }
}