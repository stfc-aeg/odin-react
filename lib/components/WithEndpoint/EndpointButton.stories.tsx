import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointButton } from './EndpointButton';

import { fn, expect, spyOn } from 'storybook/test';

// Mocked Endpoint
import { useAdapterEndpoint, transformMockCode } from '../AdapterEndpoint/index.mock';

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
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      source: {
        transform: transformMockCode,
        language: "tsx"
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

/** Standard use of the EndpointButton. */
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

/** The Button can be disabled by a Prop.*/
export const Disabled: Story = {
  args: {
    disabled: true
  },
  play: async ({canvas}) => {

    await expect(canvas.getByRole("button")).toBeDisabled();
  }
}

/** The Button is automatically disabled if pointed at a read-only Parameter */
export const DisabledBecauseParam: Story = {
  args: {
    fullpath: "rand_num"
  },
  play: async ({canvas}) => { 
    await expect(canvas.getByRole("button")).toBeDisabled();
  }
}

/** The Button can be provided a function (and optional args) */
export const PreTrigger: Story = {
  args: {
    pre_method: fn(),
    pre_args: {message: "Pre Function Args"}
  },
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    await userEvent.click(canvas.getByRole("button"));

    await expect(args.pre_method).toHaveBeenCalledWith(args.pre_args);
    await expect(put).toHaveBeenCalled();
  }
}