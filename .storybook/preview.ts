import type { Preview } from '@storybook/react-vite'

import { withThemeByDataAttribute } from '@storybook/addon-themes';

import { initialize, mswLoader } from 'msw-storybook-addon';

import 'bootstrap/dist/css/bootstrap.min.css';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  loaders: [mswLoader]
};

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-bs-theme',
  }),
];

export default preview;