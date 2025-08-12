import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinEventLog } from './index';

const meta = {
  component: OdinEventLog,
} satisfies Meta<typeof OdinEventLog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};