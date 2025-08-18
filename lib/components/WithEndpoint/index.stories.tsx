import type { Meta, StoryObj } from '@storybook/react-vite';

import { WithEndpoint } from './index';
import { Button, Card, DropdownButton, Dropdown, Form } from 'react-bootstrap';
import { AdapterEndpoint_t, useAdapterEndpoint } from '../AdapterEndpoint';
import { PropsWithChildren, cloneElement } from 'react';

import type {TestAdapterInterface} from '../../../.storybook/stories.mock'
import { OdinDoubleSlider } from '../OdinDoubleSlider';

const addr = "http://localhost:1337"

const EndpointButton = WithEndpoint(Button);
const EndpointInput = WithEndpoint(Form.Control);
const EndpointDropdown = WithEndpoint(DropdownButton);
const EndpointCheckbox = WithEndpoint(Form.Check);
const EndpointRange = WithEndpoint(Form.Range);
const EndpointDoubleRange = WithEndpoint(OdinDoubleSlider);

type TestInput = React.FC<{endpoint: AdapterEndpoint_t<TestAdapterInterface>, fullpath: string}>

const ButtonTest: TestInput = ({endpoint, fullpath}) => {
  return (
    <EndpointButton endpoint={endpoint} fullpath={fullpath} value={true}>
      Trigger
    </EndpointButton>
  )
}

const InputTest: TestInput = ({endpoint, fullpath}) => {
  
  return (
    <EndpointInput endpoint={endpoint} fullpath={fullpath}/>
  )
}

const NumInputTest: TestInput = ({endpoint, fullpath}) => {
  
  return (
    <EndpointInput endpoint={endpoint} fullpath={fullpath} type="number"/>
  )
}

const SyncInput: TestInput = ({endpoint, fullpath}) => {
  return (
    <>
    <EndpointInput endpoint={endpoint} fullpath={fullpath} type="number"/>
    <EndpointInput endpoint={endpoint} fullpath={fullpath} type="number"/>
    </>
  )
}

const ReadonlyInput: TestInput = ({endpoint, fullpath}) => {
  return (
    <EndpointInput endpoint={endpoint} fullpath={fullpath}/>
  )
}

const DropdownTest: TestInput = ({endpoint, fullpath}) => {
  return (
    <EndpointDropdown endpoint={endpoint} fullpath={fullpath}
      title={endpoint.data.selected || "Unknown"}>
        {endpoint.data.select_list ? endpoint.data.select_list.map(
          (selection, index) => (
            <Dropdown.Item eventKey={selection} key={index}>{selection}</Dropdown.Item>
          )) : <></>}
      </EndpointDropdown>
  )
}

const CheckboxTest: TestInput = ({endpoint, fullpath}) => {
  return (
    <EndpointCheckbox type="switch" label={fullpath} endpoint={endpoint} fullpath={fullpath}/>
  )
}

const RangeTest: TestInput = ({endpoint, fullpath}) => {

  return (
    <>
    <Form.Label>{`Range Test: ${fullpath}`} </Form.Label>
    <EndpointRange endpoint={endpoint} fullpath={fullpath} />
    </>
  )
}

const DoubleRangeTest: TestInput = ({endpoint, fullpath}) => {

  return (
    <EndpointDoubleRange endpoint={endpoint} title={fullpath} fullpath={fullpath}/>
  )
}


interface DisplayProps extends PropsWithChildren {
  title: string,
  fullpath: string
}

const WithEndpointDisplay: React.FC<DisplayProps> = (
  {title, fullpath, children}
) => {
  const endpoint = useAdapterEndpoint("Test", addr);

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
          {cloneElement(children, {endpoint: endpoint, fullpath: fullpath})}
      </Card.Body>
    </Card>
  )
}

const meta = {
  component: WithEndpointDisplay,
  argTypes:{
    children: {
      table: {
        disable: true
      }
    }
  }
} satisfies Meta<typeof WithEndpointDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Button",
    fullpath: "trigger",
    children: <ButtonTest/>
  }
};

export const Textbox: Story = {
    args: {
      title: "Textbox",
      fullpath: "string_val",
      children: <InputTest/>
  }
}

export const NumberTextbox: Story = {
    args: {
      title: "Textbox",
      fullpath: "num_val",
      children: <NumInputTest/>
  }
}

export const DropdownInput: Story = {
  args: {
    title: "Dropdown",
    fullpath: "selected",
    children: <DropdownTest/>
  }
}

export const CheckboxInput: Story = {
  args: {
    title: "Checkbox",
    fullpath: "toggle",
    children: <CheckboxTest/>
  }
}

export const RangeInput: Story = {
  args: {
    title: "Range Slider",
    fullpath: "num_val",
    children: <RangeTest/>
  }
}

export const DoubleRangeInput: Story = {
    args: {
    title: "Double Range Slider",
    fullpath: "two_num",
    children: <DoubleRangeTest/>
  }
}

export const TwoInput: Story = {
    args: {
      title: "Two Inputs connected to same Parameter",
      fullpath: "num_val",
      children: <SyncInput/>
  }
}

export const ReadOnly: Story = {
  args: {
    title: "Readonly Input",
    fullpath: "deep/long/nested/dict/path/readOnly",
    children: <ReadonlyInput/>
  }
}