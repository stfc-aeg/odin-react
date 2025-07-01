import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinTable, OdinTableRow } from './index';

import { Default as RowDefault, Test } from './index.OdinTableRow.stories'

// RowStories from './index.OdinTableRow.stories';

const meta = {
  component: OdinTable,
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
      options: ["None", "Single", "Multiple"],
      mapping: {
        None: undefined,
        Single: <OdinTableRow {...RowDefault.args} />,
        Multiple: <><OdinTableRow {...RowDefault.args} /><OdinTableRow {...Test.args}/></>
      },
      control: {type: "radio"}
    }
  },
  args: {
    header: true,
    widths: undefined
  }
} satisfies Meta<typeof OdinTable>;

export default meta;

type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    columns: {"name": "Name", "val": "Value"},
    children: "Multiple",
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