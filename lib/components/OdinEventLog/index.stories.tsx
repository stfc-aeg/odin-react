import type { Meta, StoryObj } from '@storybook/react-vite';

import { OdinEventLog } from './index';
import { AdapterEndpoint_t, useAdapterEndpoint } from '../AdapterEndpoint';

import type { Log } from './index';
import { fn } from 'storybook/test';
const addr = "http://localhost:1337"


type ExtractedProps = Extract<React.ComponentProps<typeof OdinEventLog>, {getLatestLogs?: never}>


const EventLogWithEndpoint: React.FC<ExtractedProps> = (props) => {
  const {endpoint, ...extractedProps} = props;
  const InsertedEndpoint = useAdapterEndpoint("Logger", addr);
  return (
    <OdinEventLog endpoint={InsertedEndpoint} {...extractedProps}/>
  )
}

let logs: Log[] = [];

const getEventLogs = (timestamp: string) => {
  console.log("Get Event Logs", timestamp);
  logs.push({timestamp: new Date(Date.now()).toISOString(),
             message: `New Log Created. Rand Num: ${Math.floor(Math.random()*10)}`,
             level: ["debug", "info", "warning", "error", "critical"][Math.floor(Math.random() * 5)] as Log["level"]})
  return logs;
}

const getAsyncEventLogs = async (timestamp: string) => {
  return new Promise<Log[]>((resolve) => {
    setTimeout(() => {
      resolve(getEventLogs(timestamp))
    }, 200);
  })
}

const PlaceholderEndpoint: AdapterEndpoint_t = {
  data: {}, metadata: {}, 
  error: null, loading: false, updateFlag: Symbol("fake"), status: "error",
  get: fn(), put: fn(), post: fn(), remove: fn(), refreshData: fn(), mergeData: fn()
}

const meta = {
  component: OdinEventLog,
  argTypes: {
    endpoint: {
      table: {
        control: false
      }
    }
  }
} satisfies Meta<typeof OdinEventLog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    path: "events",
    endpoint: PlaceholderEndpoint
  },
  render: (args) => <EventLogWithEndpoint {...args}/>,
}

export const WithMethod: Story = {
  args: {
    getLatestLogs: getEventLogs
  }
}

export const WithAsyncMethod: Story = {
  args: {
    getLatestLogs: getAsyncEventLogs
  }
}

export const WithoutLevel: Story = {
  args: {
    getLatestLogs: (timestamp: string) => {
      return getEventLogs(timestamp).map(({level, ...keepAttrs}) => keepAttrs)
    }
  }
}