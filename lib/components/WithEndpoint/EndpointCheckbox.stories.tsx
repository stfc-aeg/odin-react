import type { Meta, StoryObj } from '@storybook/react-vite';

import { EndpointCheckbox } from './EndpointCheckbox';
import { useAdapterEndpoint, transformMockCode } from '../AdapterEndpoint/index.mock';
import { Form } from 'react-bootstrap';
import { spyOn, expect } from 'storybook/test';

const meta = {
  component: EndpointCheckbox,
  args: {
    endpoint: undefined,
    fullpath: "toggle",
    label: "Test Checkbox",
    type: "checkbox"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    type: {
        options: ["checkbox", "radio", "switch"],
        control: {type: "radio"}
      }
  },
  parameters: {
    layout: "centered",
    docs: {
      source: {
        transform: transformMockCode,
        language: "tsx"
      }
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <EndpointCheckbox {...args}/>
  }
} satisfies Meta<typeof EndpointCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");
    const checkbox = canvas.getByRole("checkbox")
    await expect(checkbox).toBeChecked();  // inits with TRUE value
    
    await userEvent.click(checkbox);
    await expect(put).toHaveBeenCalledWith({value: false}, "toggle");
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(put).toHaveBeenCalledWith({value: true}, "toggle");
    await expect(checkbox).toBeChecked();

  }

};

export const RadioSelect: Story = {
  args: {
    type: "radio",
    fullpath: "selected"
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return (
      <Form>
        <EndpointCheckbox {...args} data-testid="item 1"
          name='radio-group' value="item 1" label="Item One"/>
        <EndpointCheckbox {...args} data-testid="item 2"
          name='radio-group' value="item 2" label="Item Two"/>
        <EndpointCheckbox {...args} data-testid="item 3"
          name='radio-group' value="item 3" label="Item Three"/>
      </Form>
    )
  },
  play: async ({canvas, args, userEvent}) => {
    const put = spyOn(args.endpoint, "put").mockName("endpoint.put");

    const checkboxOne = canvas.getByTestId("item 1");
    const checkboxTwo = canvas.getByTestId("item 2");
    const checkboxThree = canvas.getByTestId("item 3");

    await expect(checkboxOne).toBeChecked();
    await expect(checkboxTwo).not.toBeChecked();
    await expect(checkboxThree).not.toBeChecked();

    await userEvent.click(checkboxTwo);
    await expect(put).toHaveBeenCalledWith({value: "item 2"}, "selected");
    await expect(checkboxOne).not.toBeChecked();
    await expect(checkboxTwo).toBeChecked();
    await expect(checkboxThree).not.toBeChecked();

    await userEvent.click(checkboxThree);
    await expect(put).toHaveBeenCalledWith({value: "item 3"}, "selected");
    await expect(checkboxOne).not.toBeChecked();
    await expect(checkboxTwo).not.toBeChecked();
    await expect(checkboxThree).toBeChecked();

    await userEvent.click(checkboxOne);
    await expect(put).toHaveBeenCalledWith({value: "item 3"}, "selected");
    await expect(checkboxOne).toBeChecked();
    await expect(checkboxTwo).not.toBeChecked();
    await expect(checkboxThree).not.toBeChecked();
  }
}