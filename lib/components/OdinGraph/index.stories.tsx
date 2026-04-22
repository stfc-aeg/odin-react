import type { Meta, StoryObj } from '@storybook/react-vite';

import { Axis, FallbackPlotComponent, OdinGraph, type GraphData } from './index';
import { Layout, PlotData } from 'plotly.js';


const heatmapData = [
  [2, 4, 7, 12, 13, 14, 15, 16],
  [3, 1, 6, 11, 12, 13, 16, 17],
  [4, 2, 7, 7, 11, 14, 17, 18],
  [5, 3, 8, 8, 13, 15, 18, 19],
  [7, 4, 10, 9, 16, 18, 20, 19],
  [9, 10, 5, 27, 23, 21, 21, 21],
  [11, 14, 17, 26, 25, 24, 23, 22]
];

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
  y: Array.from(date_array, (x) => Math.sin((x.getMinutes() * 6) * (Math.PI / 180))),
  name: "Sine",
  line: { color: 'rgb(91, 206, 250)' }
}
const cosine_dataset: Partial<PlotData> = {
  x: Array.from(date_array, (x) => x.toISOString()),
  y: Array.from(date_array, (x) => Math.cos((x.getMinutes() * 12) * (Math.PI / 180))),
  name: "Cosine",
  line: { color: `rgb(245, 169, 184)`, width: 5 }
}


const custom_layout: Partial<Layout> = {
  title: { text: "Custom Layout Testing", subtitle: { text: "For Storybook" } },
  font: { family: "monospace" },
  yaxis: {
    title: { text: "Maths" },
    range: [-1.2, 1.2]
  },
  xaxis: {
    title: { text: "Time" }
  }
}


const meta = {
  component: OdinGraph,
  argTypes: {
    layout: {
      description: "Layout object for customisation. See \
      [Plotly Documentation](https://plotly.com/javascript/reference/layout/) \
      for details.",
      table: {
        type: {
          summary: "Partial<Layout>"
        }
      }
    },
    style: {
      description: "Custom CSS Styling options",
      table: {
        type: {
          summary: "CSSProperties"
        }
      }
    },
    data: {
      table: {
        type: {
          detail: "number[] | number[][] | {data: number[], axis: number}[] | Plotly.Data[]"
        }
      }
    }
  }
} satisfies Meta<typeof OdinGraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [0, 1, 2, 4],
    title: "Single Series Plot"
  }
};

/** Two dimensional data can be multiple single series */
export const MultipleSeries: Story = {
  args: {
    title: "Multiple Series Plot",
    data: [
      [0, 1, 2, 4],
      [5, 4, 3, 2]
    ],
    series_names: ["Alpha", "Beta"]
  }
}

/** Two Dimensional data can be shown as a heatmap*/
export const Heatmap: Story = {
  args: {
    title: "Heatmap",
    data: heatmapData,
    type: "heatmap"
  }
}

/** Two Dimensional data can be shown as a Contour Map*/
export const Contour: Story = {
  args: {
    title: "Contour Map",
    data: heatmapData,
    type: "contour",
    colorscale: "blackbody"
  }
}

/** Data can be defined with Axis, for data that needs to be mapped
 * against separate Y Axis
 */
export const MultipleAxis: Story = {
  args: {
    title: "Multiple Axis",
    data: mid_data,
    axis: mid_axis
  }
}

/** Data and Layout props can be provided as if the Odin Graph were just
 * a Plotly graph, for full customisation. Options can be seen in the 
 * [Plotly Documentation](https://plotly.com/javascript/react/)
 */
export const FullyCustom: Story = {
  args: {
    title: "Fully Custom",
    data: [sine_dataset, cosine_dataset],
    layout: custom_layout
  },
  argTypes: {
    data: {
      table: {
        readonly: true
      }
    }
  },
  parameters: {
    docs: {
      source: {
        language: "tsx",
        transform: async (source: string) => {

          if (source.includes("args: {")) {
            return "INVALID";
          }

          const prettier = await import('prettier/standalone');
          const prettierPluginBabel = await import('prettier/plugins/babel');
          const prettierPluginEstree = await import('prettier/plugins/estree');

          // let ret_string = source;
          const date_array = `const date_array = Array.from(Array(200), (_, x) => new Date(new Date(1992, 0, 1, 17, 0).getTime() + (x * 60000)));`;
          const sine_dataset = [
            "const sine_dataset = {",
            "x: Array.from(date_array, (x) => x.toISOString()),",
            "y: Array.from(date_array, (x) => Math.sin((x.getMinutes()* 6)*(Math.PI/180))),",
            `name: "Sine",`,
            `line: { color: 'rgb(91, 206, 250)' }`,
            "}\n"
          ].join("\n");
          const cosine_dataset = [
            "const cosine_dataset = {",
            "x: Array.from(date_array, (x) => x.toISOString()),",
            "y: Array.from(date_array, (x) => Math.cos((x.getMinutes() * 12) * (Math.PI / 180))),",
            `name: "Cosine",`,
            `line: { color: 'rgb(245, 169, 184)', width: 5 }`,
            "}\n"
          ].join("\n");


          const data_replaced_source = source.replace(/data={\[[\s\S]*\]}/m, `data={[sine_dataset, cosine_dataset]}`);
          const layout = source.match(/layout={(?<layout>{[\s\S]*})}/m)?.groups?.layout;
          const layout_replaced_source = data_replaced_source.replace(/layout={{[\s\S]*}}/m, `layout={layout}`)
          let ret_string = source;
          if (!(source.split("\n")[0].includes("// Date start"))) {
            ret_string = [
              "// Date start at 17:00, Jan 1st 1992, increase by 1 minute each step",
              date_array, sine_dataset, cosine_dataset,
              ["const layout =", layout ?? "{}"].join(" "),
              "",
              ["return", layout_replaced_source].join(" "),
            ].join("\n");
          }
          return prettier.format(ret_string,
            {
              parser: 'babel-ts',
              plugins: [prettierPluginBabel, prettierPluginEstree],
              printWidth: 100,
              objectWrap: "collapse"
            }
          );
        }
      }
    }
  }
}

/** If Plotly React is not installed, this fallback graph will be displayed.
 * Plotly is an optional install for projects due to its size, and the fact
 * not every Odin React GUI needs its graphing capabilities.
 */
export const FallbackGraph: Story = {
  args: {
    data: [1, 2, 3, 4]
  },
  render: (args) => {
    return <FallbackPlotComponent {...args} />
  }
}