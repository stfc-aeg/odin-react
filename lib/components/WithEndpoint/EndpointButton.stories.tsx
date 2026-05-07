import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointButton } from './EndpointButton';

import { fn, expect, spyOn, Mock } from 'storybook/test';

// Mocked Endpoint
import { useAdapterEndpoint, transformMockCode } from '../AdapterEndpoint/index.mock';

type testMethodProps = {
  value?: number;
  message: string;
}

const testPreMethod = ({value, message}: testMethodProps) => {
  console.log(message);
 
  return (value ?? 0) * 2;
}

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

const metaWithFunc = {
  component: (EndpointButton<testMethodProps, undefined>),
  args: {
    endpoint: undefined,
    fullpath: "trigger",
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
    },
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <EndpointButton {...args}>Test Button: {args.fullpath}</EndpointButton>
  }
} satisfies Meta<typeof EndpointButton<testMethodProps, undefined>>;

export default meta;

type Story = StoryObj<typeof meta>;

type StoryWithFunc = StoryObj<typeof metaWithFunc>;

/** Standard use of the EndpointButton. */
export const Default: Story = {
  args: {
    value: true
  },
  play: async ({canvas, args, userEvent}) => {

    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    await userEvent.click(canvas.getByRole("button"));

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

/** 
 * The Button can be provided a function (and optional args). This function
 * can receive the Param value; and if its the pre_method, can return a value
 * to send via the PUT request instead of the original value (so it may modify
 * the value before sending) */
export const PreTrigger: StoryWithFunc = {
  args: {
    value: 12,
    pre_method: fn(testPreMethod),
    post_method: fn(() => {console.log("Post Method without Args")}),
    pre_args: { value: undefined, message: "Pre Function" }
  },
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    await userEvent.click(canvas.getByRole("button"));

    await expect(args.pre_method).toHaveBeenCalledWith(args.pre_args);
    await expect(put).toHaveBeenCalledWith({"value": 24}, "trigger");
    await expect(args.post_method).toHaveBeenCalled();
    
    // ensuring order of pre/post methods and put method
    const pre_order = (args.pre_method as Mock<typeof testPreMethod>).mock.invocationCallOrder[0];
    const put_order = put.mock.invocationCallOrder[0];
    const post_order = (args.post_method as Mock<() => void>).mock.invocationCallOrder[0];
    await expect(pre_order).toBeLessThan(put_order);
    await expect(put_order).toBeLessThan(post_order);
  }
}