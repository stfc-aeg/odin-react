import type { Meta, StoryObj } from '@storybook/react-vite';

import { DemoPage } from './demoPage';

import { useAdapterEndpoint, transformMockCode } from '../lib/components/AdapterEndpoint/index.mock';
import { OdinApp } from '../lib/components/OdinApp';

const sourceString = `
/** DemoPage.tsx */
interface DemoPageProps {
    endpoint: AdapterEndpoint<EndpointData>
}

const DemoPage = (
    { endpoint }: DemoPageProps
) => {

    const [triggeredStateMessage, changeMessage] = useState("Default\\nNot Yet Set");

    const [input, changeInput] = useState(endpoint.data.string_val ?? "");

    const PreMethod = () => {
        changeMessage("Trigger Clicked\\nAwaiting Data");
    }

    const PostMethod = (num: number) => {
        changeMessage("Post Method\\nNumber: " + num);
    }

    return (
        <Container>
          <Row>
            <br />
          </Row>
          <Row>
            <Col>
              <Stack>
                <TitleCard title="Click Button">
                  <InputGroup>
                    <InputGroup.Text>Trigger</InputGroup.Text>
                    <EndpointButton endpoint={endpoint} fullpath='trigger' value={42}
                      pre_method={PreMethod} post_method={PostMethod}
                      post_args={[endpoint.data.rand_num]}>
                        Click me!
                    </EndpointButton>
                    <Form.Control as="textarea" readOnly value={triggeredStateMessage} />
                  </InputGroup>
                </TitleCard>
                <TitleCard title="Inputs">
                  <InputGroup>
                    <InputGroup.Text>Enter Value:</InputGroup.Text>
                    <EndpointInput endpoint={endpoint} fullpath="num_val" type="number" />
                  </InputGroup>
                  <InputGroup>
                    <InputGroup.Text>Enter String:</InputGroup.Text>
                    <EndpointInput endpoint={endpoint} fullpath="deep/long/nested/path/val" />
                  </InputGroup>
                </TitleCard>
                <TitleCard title="Button Value Controlled by Input">
                  <InputGroup>
                    <InputGroup.Text>Enter Value</InputGroup.Text>
                    <Form.Control value={input} onChange={(event) => changeInput(event.target.value)} />
                    <EndpointButton endpoint={endpoint} fullpath="string_val" value={input}>
                      Submit Value
                    </EndpointButton>
                  </InputGroup>
                </TitleCard>
                <TitleCard title="Using a Tooltip">
                  <OverlayTrigger overlay={<Tooltip id="demo-tooltip">Float Value</Tooltip>}>
                    <EndpointInput endpoint={endpoint} fullpath='float_val' step={0.5} />
                  </OverlayTrigger>
                </TitleCard>
              </Stack>
            </Col>
            <Col>
              <Stack>
                <TitleCard>
                  <OdinGraph data={endpoint.data.graph_data ?? [0]} title="Demo Graph" />
                </TitleCard>
                <TitleCard title="Dropdown">
                    <InputGroup>
                        <InputGroup.Text>Select Option</InputGroup.Text>
                        <EndpointDropdown endpoint={endpoint} fullpath="selected" />
                    </InputGroup>
                </TitleCard>
              </Stack>
            </Col>
          </Row>
        </Container>
    )
}

export { DemoPage };
/** End of DemoPage.tsx */

/** App.tsx */

import { DemoPage } from "./DemoPage";

const App = () => {

    const endpoint = useAdapterEndpoint("test", import.meta.env.VITE_ENDPOINT_URL);

    return (
        <OdinApp navLinks={["Demo Page"]}>
            <DemoPage endpoint={endpoint} />
        </OdinApp>
    )
}

export default App
/** End of App.tsx */
`

const transformCode = async (source: string) => {
    const prettier = await import('prettier/standalone');
    const prettierPluginBabel = await import('prettier/plugins/babel');
    const prettierPluginEstree = await import('prettier/plugins/estree');

    return prettier.format(source, {
        parser: 'babel-ts',
        plugins: [prettierPluginBabel, prettierPluginEstree]
    })
}

const meta = {
    component: DemoPage,
    title: "Demo Page",
    args: {
        endpoint: undefined
    },
    render: (args) => {
        args.endpoint = useAdapterEndpoint("test", "http://localhost:1338");
        return (
            <OdinApp navLinks={["Demo Page"]}>
                <DemoPage {...args} />
            </OdinApp>
        )
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            source: {
                code: await transformCode(sourceString),
                language: "tsx"
            }
        }
    }
} satisfies Meta<typeof DemoPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Example Page, showing how you might layout a single page application
 * 
 * It's recommended that you use the "Open Canvas in New Tab" button at the top right
 * of the example window to view the page as it would be seen in a full application.
 * 
 * The "Show Code" button shows the source of both the DemoPage component,
 * and how you'd include it in the App.tsx component.
*/
export const Default: Story = {
    args: {},
};