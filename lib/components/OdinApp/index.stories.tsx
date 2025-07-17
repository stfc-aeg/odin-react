import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinApp } from './index';
import { TitleCard } from '../TitleCard';

import TestImg from '../../assets/testImage.png';

const AppPage = ({title="Test Page"}) => {
  return (
    <>
      <TitleCard title={title}/>
    </>
  )
}

const meta = {
  component: OdinApp,
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    icon_marginLeft: {
      type: "string"
    },
    icon_marginRight: {
      type: "string"
    }
  },
  args: {
    children: <AppPage/>
  }
} satisfies Meta<typeof OdinApp>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Storybook"
  }
};

export const MultiPage: Story = {
  args: {
    ...Default.args,
    navLinks: ["Page One", "Page Two", "Page 3", {"Nested Pages": ["Page 4a", "Page 4b"]}],
    children: [
      <AppPage title='Page One'/>,
      <AppPage title='Page Two'/>,
      <AppPage title='Page Three'/>,
      <AppPage title='Page Four A'/>,
      <AppPage title='Page Four B'/>
    ]
  }
}

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    custom_icon: TestImg
  }
}