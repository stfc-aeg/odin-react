import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinDoubleSlider } from './index';

import type { OverlayTriggerProps } from 'react-bootstrap';

const PlacementOptionsList: (OverlayTriggerProps["placement"] | undefined)[] = [
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
  argTypes: {
    tooltipPosition: {
      options: PlacementOptionsList
    },
    onChange: {type: "function"},
    onKeyPress: {type: "function"}
  }
} satisfies Meta<typeof OdinDoubleSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
  }
};

export const NoTooltip: Story = {
  args: {
    showTooltip: false
  }
};

export const Title: Story = {
  args: {
    title: "Title"
  }
};

export const NoMinMaxLabels: Story = {
  args: {
    showMinMaxValues: false
  }
};

export const ValueAndStep: Story = {
  args: {
    tooltipPosition: "auto",
    value: [20, 75],
    step: 5,
    min: 10,
    max: 82
  }
};
