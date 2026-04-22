import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { OdinTable } from './index';
import { OdinTableRow } from './index';

const RowDefs: { [key: string]: ComponentProps<typeof OdinTableRow>["row"] } = {
  "Normal": { "name": "Default", "val": 25 },
  "Extra Value": { "name": "Test", "val": "Testing One", "unrendered": "Wont Be Seen" },
  "Missing Matching": { "name": "Missing" },
  "No Matching": { "unrendered": "Wont Be Seen" }
}


const meta = {
  component: OdinTable,
  subcomponents: { OdinTableRow },
  args: {
    columns: { "name": "Name", "val": "Value" }
  },
  argTypes: {
    children: {
      options: Object.keys(RowDefs),
      mapping: Object.keys(RowDefs).reduce(
        (prev, cur) => (
          { ...prev, [cur]: (<OdinTableRow key={cur} row={RowDefs[cur]} />) }
        ), {}
      ),
      control: { type: "check" },
      table: {
        type: {
          summary: "ReactNode",
          detail: "One or more OdinTableRow(s). Likely generated via the map function"
        }
      }
    }
  }
} satisfies Meta<typeof OdinTable>;

export default meta;


type Story = StoryObj<typeof meta>;

/** Default use of the Table */
export const Default: Story = {
  args: {
    children: ["Normal", "Extra Value", "Missing Matching"]
  }
};

/** Tables can be displayed without the Head Row, if required*/
export const NoHeader: Story = {
  args: {
    ...Default.args,
    header: false
  }
}

/**
 * OdinTable uses the Bootstrap Table, and so can be styled using the
 * same props. see [The Bootstrap Docs](https://react-bootstrap.netlify.app/docs/components/table)
 * for more information
*/
export const Styled: Story = {
  args: {
    ...Default.args,
    bordered: true,
    hover: true,
    striped: "columns"
  }
}