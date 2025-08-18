import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinLiveView, ZoomableImage } from './index';

import { useAdapterEndpoint } from '../AdapterEndpoint';
import React from 'react';


interface ContainerProps 
  extends Omit<React.ComponentProps<typeof OdinLiveView>, "endpoint"> {
    adapter: string;
}

const Container: React.FC<ContainerProps> = ({adapter, ...props}) => {
  const endpoint = useAdapterEndpoint(adapter, "http://localhost:1337");

  return (
    <OdinLiveView endpoint={endpoint} {...props}/>
  )

}

const meta = {
  component: Container,
  subcomponents: {OdinLiveView, ZoomableImage},
  argTypes: {
    adapter: {
      control: false
    }
  },
  args: {
    justImage: false
  }

} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    adapter: "live_view"
  }
};

export const NoColor: Story = {
  args: {
    adapter: "live_view_nc"
  }
};

export const NoClip: Story = {
  args: {
    adapter: "live_view_clipless"
  }
};

export const JustImage: Story = {
  args: {
    adapter: "live_view",
    justImage: true
  }
};
