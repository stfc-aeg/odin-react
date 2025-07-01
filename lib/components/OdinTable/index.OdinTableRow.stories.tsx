import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinTableRow } from './index';

const meta = {
  component: OdinTableRow,
} satisfies Meta<typeof OdinTableRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    row: {"name": "Default", "val": 25}
  }
};

export const Test: Story = {
  args: {
    row: {"name": "Test", "val": "Testing One", "unrendered": true}
  }
}