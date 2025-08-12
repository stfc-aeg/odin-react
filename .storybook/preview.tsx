import type { Preview } from '@storybook/react-vite'

import { withThemeByDataAttribute } from '@storybook/addon-themes';

import { initialize, mswLoader } from 'msw-storybook-addon';
import { http } from 'msw';

import { OdinErrorContext } from '../lib/main';

import { getHandler, putHandler } from './stories.mock';

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
    msw: {
      handlers: [
        http.get<{adapter: string}>("http://localhost:1337/api/0.1/:adapter", getHandler),
        http.get<{adapter: string, path: string[]}>("http://localhost:1337/api/0.1/:adapter/:path+", getHandler),
        http.put<{adapter: string}>("http://localhost:1337/api/0.1/:adapter", putHandler),
        http.put<{adapter: string, path: string[]}>("http://localhost:1337/api/0.1/:adapter/:path+", putHandler)
      ]
    }
  },
  globalTypes: {
    margin: {
      description: "Add Margins to the side of the Component",
      toolbar: {
        title: "Margin",
        items: ["0", "5", "10", "20"],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    margin: "5"
  },
  decorators: [
    (Story, context) => (
      <OdinErrorContext>
        <div style={{ margin: `1rem ${context.globals.margin || "0"}rem` }}>
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
  loaders: [mswLoader]
};

export default preview;