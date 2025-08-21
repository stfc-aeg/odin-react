import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinLiveView, ZoomableImage } from './index';

import { AdapterEndpoint_t, useAdapterEndpoint } from '../AdapterEndpoint';
import React from 'react';


// interface ContainerProps 
//   extends Omit<React.ComponentProps<typeof OdinLiveView>, "endpoint"> {
//     adapter?: string;
//     endpoint?: AdapterEndpoint_t;
// }

type ContainerProps = React.ComponentProps<typeof OdinLiveView> & {adapter?: string}

const Container: React.FC<ContainerProps> = ({adapter="live_view", ...props}) => {
  const InjectedEndpoint = useAdapterEndpoint(adapter, "http://localhost:1337");

  const {endpoint, ...extractedProps} = props;
  return (
    <OdinLiveView endpoint={InjectedEndpoint} {...extractedProps}/>
  )

}

const meta = {
  component: OdinLiveView,
  subcomponents: {ZoomableImage},
  argTypes: {
    adapter: {
      table: {
        disable: true
      }
    },
    endpoint: {
      
    }
  },
  args: {
    justImage: false
  },
  render:({adapter, ...args}) => (
    <Container adapter={adapter} {...args}/>
  )

} satisfies Meta<ContainerProps>;

export default meta;

type Story = StoryObj<ContainerProps>;

export const Default = {
  args: {
    adapter: "live_view"
  }
} satisfies Story;

export const NoColor: Story = {
  args: {
    adapter: "live_view_nc",
    title: "Live View Without Colourmapping"
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
