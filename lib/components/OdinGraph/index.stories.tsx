import type { Meta, StoryObj } from '@storybook/react-vite';

import { Axis, OdinGraph, type GraphData } from './index';
import { Layout, PlotData } from 'plotly.js';

const mid_data: GraphData[] = [
  { data: [5, 10, 15, 20], axis: 1 },
  { data: [18, 42, 6, 11], axis: 2 }
]

const mid_axis: Axis[] = [
  { side: "right", title: { text: "Current" }, range: [0, 25] },
  { side: "left", title: { text: "Voltage" }, invert: true },
]

const date_array = Array.from(Array(200), (_, x) => new Date(new Date(1992, 0, 1, 17, 0).getTime() + (x * 60000)));

const sine_dataset: Partial<PlotData> = {
  // Date start at 17:00, Jan 1st 1992, increase by 1 minute each step
  x: Array.from(date_array, (x) => x.toISOString()),
  y: Array.from(date_array, (x) => Math.sin((x.getMinutes()* 6)*(Math.PI/180))),
  name: "Sine"
}
const cosine_dataset: Partial<PlotData> = {
  x: Array.from(date_array, (x) => x.toISOString()),
  y: Array.from(date_array, (x) => Math.cos((x.getMinutes() * 12) * (Math.PI / 180))),
  name: "Cosine"
}

const custom_layout: Partial<Layout> = {
  title: { text: "Custom Layout Testing", subtitle: "For Storybook" },
  yaxis: {
    title: { text: "Maths" },
    range: [-1.2, 1.2]
  },
  xaxis: {
    title: {text: "Time" }
  }
}


const meta = {
  component: OdinGraph,
} satisfies Meta<typeof OdinGraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [0, 1, 2, 4],
    title: "Single Series Plot"
  }
};

export const MultipleSeries: Story = {
  args: {
    title: "Multiple Series Plot",
    data: [
      [0, 1, 2, 4],
      [5, 4, 3, 2]
    ]
  }
}

export const Heatmap: Story = {
  args: {
    title: "Heatmap",
    data: [
      [0, 1, 2, 3],
      [1, 2, 3, 0],
      [2, 3, 0, 1],
      [3, 0, 1, 2]
    ],
    type: "heatmap"
  }
}

/** Data can be defined with Axis, for data that needs to be mapped
 * against separate y Axis
 */
export const MultipleAxis: Story = {
  args: {
    title: "Multiple Axis",
    data: mid_data,
    axis: mid_axis
  }
}

export const FullyCustom: Story = {
  args: {
    title: "Fully Custom",
    data: [sine_dataset, cosine_dataset],
    layout: custom_layout
  }
}