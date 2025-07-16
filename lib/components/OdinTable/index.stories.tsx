import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinTable, OdinTableRow } from './index';
import type { OdinTableRowProps } from './index';

const RowDefs: {[key: string]: OdinTableRowProps["row"]} = {
  "Normal": {"name": "Default", "val": 25},
  "Extra Value": {"name": "Test", "val": "Testing One", "unrendered": true},
  "Missing Matching": {"name": "Missing"},
  "No Matching": {"unrendered": true}
}

const meta = {
  component: OdinTable,
  subcomponents: { OdinTableRow },
  argTypes: {
    widths: {
      control: "object",
      description: "Define the widths for each column using CSS measurements",
      type: {name: 'object', value: {key: {name: "string"}}}
    },
    header: {
      control: 'boolean',
      table: { defaultValue: {summary: "true"} }
    },
    children: {
      options: Object.keys(RowDefs),
      mapping: Object.keys(RowDefs).reduce(
        (prev, cur) =>
        ({...prev, [cur]: <OdinTableRow row={RowDefs[cur]}/>}), {}
      ),
      control: {type: "check"}
    }
  },
  args: {
    header: true,
    widths: undefined,
    bordered: false,
    striped: true,
    hover: true
  }
} satisfies Meta<typeof OdinTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns: {"name": "Name", "val": "Value"},
    children: ["Normal", "Extra Value"],
  }
};

export const Bordered: Story = {
  args: {
    ...Default.args,
    bordered: true,
    hover: true
  }
}

export const Headerless: Story = {
  args: {
    ...Default.args,
    header: false
  }
}