import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../docs/Introduction.mdx", // default page
    "../docs/*.mdx",
    // "../lib/**/*.mdx",
    "../lib/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-themes",
    "storybook-dark-mode"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      strictMode: false
    }
  },
  staticDirs: ["../public"],
  core: {
    disableTelemetry: true
  }
};
export default config;