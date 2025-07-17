import type { Meta, StoryObj } from '@storybook/react-vite';

import { TitleCard } from './index';


const meta = {
  title: "TitleCard",
  component: TitleCard,
  argTypes: {
    children: {
      options: ['Normal', 'Bold', 'Italic'],
      mapping: {
        Normal: <span>Normal</span>,
        Bold: <b>Bold</b>,
        Italic: <i>Italic</i>,
      },
      control: { type: 'radio' },
    }
  }
} satisfies Meta<typeof TitleCard>;

export default meta;

type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    title: "Story"
  }
};

export const Titleless: Story = {
  args: {
    title: undefined
  }
}