import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinGraph } from './index';

const meta = {
  component: OdinGraph,
  args: {
    data: [0, 1, 2, 4]
  }
} satisfies Meta<typeof OdinGraph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};