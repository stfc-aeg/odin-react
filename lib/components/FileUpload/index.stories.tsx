import type { Meta, StoryObj } from '@storybook/react-vite';
import { useAdapterEndpoint, transformMockCode } from '../AdapterEndpoint/index.mock';
import { FileUpload } from './index';
import { expect, spyOn, fn } from 'storybook/test';

const meta = {
  component: FileUpload,
  args: {
    endpoint: undefined,
    fullpath: "upload"
  },
  argTypes: {
    endpoint: {
      table: {
        readonly: true
      }
    },
    fullpath: {
      table: {
        type: {
          summary: "string",
          detail: "Typescript can validate the path based on the AdapterEndpoint's Tree"
        }
      }
    },
    multiple: {
      type: "boolean",

      description: "Enable Multiple file upload in a single POST request.",
    },
    accept: {
      control: "text",
      description: "Comma separated list of allowed file types. If not defined, will permit any files.",
      type: "string"
    }
  },
  parameters: {
    docs: {
      source: {
        transform: transformMockCode,
        language: "tsx"
      }
    }
  },
  render: (args) => {
    args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
    return <FileUpload {...args} />
  }
} satisfies Meta<typeof FileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default use of the Component.
 */
export const Default: Story = {
  args: {},
  play: async ({ args, canvas, userEvent }) => {
    const post = spyOn(args.endpoint, "post").mockName("endpoint.post");
    const input = canvas.getByRole("upload") as HTMLInputElement;

    await expect(input).toHaveDisplayValue("");
    await expect(post).not.toHaveBeenCalled();

    const file = new File(["Foo"], "foo.txt", { type: 'text/plain' });
    const formData = new FormData();
    formData.append("file", file);
    await userEvent.upload(input, file);

    await expect(input.files?.length).toBe(1);
    await expect(input.files?.[0]).toBe(file);
    await expect(post).toHaveBeenCalledWith(formData, args.fullpath, "multipart/form-data");

  }
};

/**
 * Setup the Component to upload multiple files at once.
 */
export const MultipleFile: Story = {
  args: {
    multiple: true
  },
  play: async ({ args, canvas, userEvent }) => {
    const post = spyOn(args.endpoint, "post").mockName("endpoint.post");
    const input = canvas.getByRole("upload") as HTMLInputElement;

    await expect(input).toHaveDisplayValue("");
    await expect(post).not.toHaveBeenCalled();

    const files = [
      new File(["Foo"], "foo.txt"),
      new File(["Bar"], "bar.txt"),

    ]

    const formData = new FormData();
    for (const file of files) {
      formData.append("file", file);
    }

    await userEvent.upload(input, files);

    await expect(input.files?.length).toBe(files.length);
    await expect(post).toHaveBeenCalledWith(formData, args.fullpath, "multipart/form-data");
  }
}

/**
 * Use the standard HTML File Input property to filter allowed file types.
 * When clicking, only the specified filetypes will be visible in the "Open File" popup.
 */
export const FilteredTypes: Story = {
  args: {
    accept: ".txt,.json"
  },
  play: async ({ args, canvas, userEvent }) => {
    const post = spyOn(args.endpoint, "post").mockName("endpoint.post");
    const input = canvas.getByRole("upload") as HTMLInputElement;

    await expect(input).toHaveDisplayValue("");
    await expect(post).not.toHaveBeenCalled();

    const files = [
      new File(["Valid"], "valid.txt"),
      new File(["Valid JSON"], "valid.json"),
      new File(["Invalid"], "invalid.png")
    ]
    const formData = new FormData();
    formData.append("file", files[0]);

    await userEvent.upload(input, files[2]);
    await expect(post).not.toHaveBeenCalled();

    await userEvent.upload(input, files[0]);
    await expect(input.files?.length).toBe(1);
    await expect(input.files?.[0]).toBe(files[0]);
    await expect(post).toHaveBeenCalledWith(formData, args.fullpath, "multipart/form-data");
    
    const other_formData = new FormData();
    other_formData.append("file", files[1]);
    await userEvent.upload(input, files[1]);
    await expect(input.files?.length).toBe(1);
    await expect(input.files?.[0]).toBe(files[1]);
    await expect(post).toHaveBeenCalledWith(other_formData, args.fullpath, "multipart/form-data");

  }
}