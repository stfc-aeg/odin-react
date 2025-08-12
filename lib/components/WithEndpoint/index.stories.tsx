import type { Meta, StoryObj } from '@storybook/react-vite';

import { WithEndpoint } from './index';
import { Button, Card } from 'react-bootstrap';
import { AdapterEndpoint_t } from '../AdapterEndpoint';

const EndpointButton = WithEndpoint(Button);

interface WithEndpointProps {
  WithEndpointComponent: React.FC;
  adapter: AdapterEndpoint_t;
}

const WithEndpointDisplay: React.FC<WithEndpointProps> = (
  {WithEndpointComponent, adapter}
) => {
  return (
    <Card>
      <Card.Body>
        <WithEndpointComponent endpoint
      </Card.Body>
    </Card>
  )
}

const meta = {
  component: WithEndpoint,
} satisfies Meta<typeof WithEndpoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};