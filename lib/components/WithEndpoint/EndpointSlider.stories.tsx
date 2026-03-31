import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, spyOn, waitFor } from 'storybook/test';
import { resetMockData, useAdapterEndpoint } from '../AdapterEndpoint/index.mock';
import { EndpointSlider } from './EndpointSlider';

const PlacementOptionsList: ComponentProps<typeof EndpointSlider>["tooltipPlacement"][] = [
  "auto",
  "auto-end",
  "auto-start",
  "bottom",
  "bottom-end",
  "bottom-start",
  "left",
  "left-end",
  "left-start",
  "right",
  "right-end",
  "right-start",
  "top",
  "top-end",
  "top-start"
]

const meta = {
  component: EndpointSlider,
  args: {
    endpoint: undefined,
    fullpath: "num_val"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    tooltipPlacement: {
      options: PlacementOptionsList
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return ( <EndpointSlider {...args} /> )
  },
  beforeEach: async () => {
    resetMockData();
  }
} satisfies Meta<typeof EndpointSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({args, canvas, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const slider = canvas.getByRole("slider") as HTMLInputElement;
    
    await userEvent.pointer({ keys: `[MouseLeft>]`, target: slider })
    //simulate the mouse movement by setting the slider value
    await waitFor(() => slider.value = "75");
    await userEvent.pointer({ keys: `[/MouseLeft]`, target: slider })
    await expect(put).toHaveBeenCalledWith({ value: 75}, args.fullpath);

    await userEvent.pointer({ keys: `[MouseLeft>]`, target: slider })
    //simulate the mouse movement by setting the slider value. Massive value to test maximum
    await waitFor(() => slider.value = "1000");
    await userEvent.pointer({ keys: `[/MouseLeft]`, target: slider })
    await expect(put).toHaveBeenCalledWith({ value: 90 }, args.fullpath);

  }
};