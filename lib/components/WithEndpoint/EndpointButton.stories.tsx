import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointButton } from './EndpointButton';

import { fn, expect, spyOn, mocked, sb, userEvent } from 'storybook/test';

// Mocked Endpoint
import { useAdapterEndpoint } from '../AdapterEndpoint/index.mock';

const meta = {
  component: EndpointButton,
  args: {
    endpoint: undefined,
    fullpath: "trigger"
  },
  argTypes: {
    endpoint: {
      control: {
        disable: true
      }
    },
    value: {
      table: {
        type: {
          summary: "ParamTree",
          detail: "String, Number, Boolean, null/undefined, or an array or dict of those values"
        }
      }
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <EndpointButton {...args}>Test Button: {args.fullpath}</EndpointButton>
  }
} satisfies Meta<typeof EndpointButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: true
  },
  play: async ({canvas, args, userEvent}) => {

    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    await userEvent.click(canvas.getByRole("button"));

    await expect(put).toHaveBeenCalled();
    await expect(put).toHaveBeenCalledWith({value: true}, "trigger");
    await expect(put).toHaveReturnedWith({value: null});
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  },
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const button = canvas.getByRole("button");
    await expect(button).toBeDisabled();

    await expect(put).not.toHaveBeenCalled();
  }
}

export const DisabledBecasueParam: Story = {
  args: {
    fullpath: "rand_num"
  },
  play: async ({canvas, args, userEvent}) => { 
    await expect(canvas.getByRole("button")).toBeDisabled();
  }
}

export const PreTrigger: Story = {
  args: {
    pre_method: fn()
  },
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    await userEvent.click(canvas.getByRole("button"));

    await expect(args.pre_method).toHaveBeenCalled();
    await expect(put).toHaveBeenCalled();
  }
}