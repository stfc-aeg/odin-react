import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { OdinDoubleSlider } from './index';

const PlacementOptionsList: ComponentProps<typeof OdinDoubleSlider>["tooltipPosition"][] = [
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
  component: OdinDoubleSlider,
  argTypes : {
    tooltipPosition: {
      options: PlacementOptionsList
    }
  }
} satisfies Meta<typeof OdinDoubleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default appearance of the Double Slider */
export const Default: Story = {};

/** Double Slider with Title */
export const WithTitle: Story = {
  args: {
    title: "Demo Double Sliders"
  }
};

/** Double slider without the Min and Max Labels */
export const WithoutLabels: Story = {
  args: {
    showMinMaxValues: false
  }
}

/** Disabled Double slider */
export const Disabled: Story = {
  args: {
    disabled: true
  }
};