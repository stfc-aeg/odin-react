import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinApp } from './index';
import { Container } from 'react-bootstrap';

import TestImg from '../../assets/testImage.png';

const AppPage = ({title="Test Page"}) => {
  return (
    <Container>
      <h1>{title}</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
        do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </Container>
  )
}

const meta = {
  component: OdinApp,
  args: {
    title: "Odin Storybook",
    navLinks: ["Home"]
  },
  argTypes: {
    navLinks : {
      table: {
        type: {
          detail: "List of strings and/or objects of {title, [links]} for dropdowns."
        }
      }
    },
    icon_marginLeft: {
      control: {
        type: "text"
      }
    },
    icon_marginRight: {
      control: {
        type: "text"
      }
    }
  },
  render: (args) => {
    return (
      <OdinApp {...args}>
        <Container>
          <h1>Home Page</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute
            irure dolor in reprehenderit in voluptate velit esse cillum
            dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
        </Container>
      </OdinApp>
    )
  }
} satisfies Meta<typeof OdinApp>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default use of the OdinApp */
export const Default: Story = {
  args: {},
};

/** Using a custom Icon with custom padding */
export const CustomIcon: Story = {
  args: {
    custom_icon: TestImg,
    icon_marginLeft: "10px",
    icon_marginRight: "3rem"
  }
}

/** 
 * An App can have multiple Pages. The order of pages given as children
 * should match with the order of the links provided by the navLinks prop
 */
export const MultiplePages: Story = {
  args: {
    navLinks: [
      "Page One",
      "Page Two",
      "Page 3",
      {
        "Page Dropdown": [
          "Page 4a", "Page 4b"
        ]
      }
    ]
  },
  render: (args) => {
    return (
      <OdinApp {...args}>
        <AppPage title='Page One' />
        <AppPage title='Page Two' />
        <AppPage title='Page Three' />
        <AppPage title='Page Four A' />
        <AppPage title='Page Four B' />
      </OdinApp>
    )
  }
}