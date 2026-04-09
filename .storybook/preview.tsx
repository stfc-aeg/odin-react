import type { Preview } from '@storybook/react-vite';
import { themes } from 'storybook/theming';
import { useDarkMode } from 'storybook-dark-mode';
import { DocsContainer } from '@storybook/addon-docs/blocks';
import { http, passthrough } from 'msw';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { OdinErrorContext } from '../lib/components/OdinErrorContext';
import { apiVersionHandler, getHandler, getHandlerUpdate, putHandler, putHandlerUpdate } from './stories.mock';

import 'bootstrap/dist/css/bootstrap.min.css';
import type { ParamNode } from '../lib/components/AdapterEndpoint';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({
  quiet: true,
  serviceWorker: {
    //change URL to support MSW mocking on Github Pages, the ./ in front is IMPORTANT
    //otherwise it looks for the file in the root of the organisation Github Page, which doesn't exist
    url: "./mockServiceWorker.js"
  },
  onUnhandledRequest: "bypass"
});

const ThemedDocsContainer: typeof DocsContainer = (props) => {

  return (
    <DocsContainer {...props} theme={useDarkMode() ? themes.dark : themes.light} />
  )
}

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
        http.get("/lib/assets/*", passthrough),
        http.get("/lib/components/*", passthrough),
        http.all("/index.json", passthrough),
        http.all("*/storybook-stories.js*", passthrough),
        // API version checking
        http.get<{ port: string }>("http://localhost\\::port/api", apiVersionHandler),
        // pre Odin 2.0 GET/PUT requests
        http.get<{ adapter: string }>("http://localhost:1337/api/0.1/:adapter", getHandler),
        http.get<{ adapter: string, path: string[] }>("http://localhost:1337/api/0.1/:adapter/:path+", getHandler),
        http.put<{ adapter: string }, ParamNode>("http://localhost:1337/api/0.1/:adapter", putHandler),
        http.put<{ adapter: string, path: string[] }, ParamNode>("http://localhost:1337/api/0.1/:adapter/:path+", putHandler),

        // Odin 2.0 GET/PUT requests. Note differnt path (no API version)
        http.get<{ adapter: string }>("http://localhost:1338/api/:adapter", getHandlerUpdate),
        http.get<{ adapter: string, path: string[] }>("http://localhost:1338/api/:adapter/:path+", getHandlerUpdate),
        http.put<{ adapter: string }, ParamNode>("http://localhost:1338/api/:adapter", putHandlerUpdate),
        http.put<{ adapter: string, path: string[] }, ParamNode>("http://localhost:1338/api/:adapter/:path+", putHandlerUpdate),

      ]
    },
    docs: {
      container: ThemedDocsContainer
    },
    darkMode: {
      stylePreview: true
    },
    backgrounds: {
      disable: true
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
        <div
          style={{
            padding: `1rem ${context.globals.margin || "0"}rem`,
            backgroundColor: `var(--bs-body-bg)`
          }}
          data-bs-theme={useDarkMode() ? "dark" : "light"}
        >
          <Story />
        </div>
      </OdinErrorContext>
    ),
  ],
  tags: ['autodocs'],
  loaders: [mswLoader]
};

export default preview;