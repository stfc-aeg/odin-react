import type { Preview } from '@storybook/react-vite'

import { withThemeByDataAttribute } from '@storybook/addon-themes';

import { initialize, mswLoader } from 'msw-storybook-addon';

import { OdinErrorContext } from '../lib/main';

import 'bootstrap/dist/css/bootstrap.min.css';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
// initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <OdinErrorContext>
        <div style={{ margin: '1rem 10rem' }}>
        <Story />
        </div>
      </OdinErrorContext>
    ),
    withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-bs-theme',
  }),
  ],
  tags: ['autodocs'],
  // loaders: [mswLoader]
};

export default preview;