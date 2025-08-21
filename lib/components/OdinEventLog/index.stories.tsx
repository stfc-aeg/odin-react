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
        type: {summary: "AdapterEndpoint_t | never", detail: "Cannot coexist with getLatestLogs prop"},
        category: "Mutually Exclusive",
        subcategory: "Endpoint"
      },
      control: false,
      type: {required: true, name: "other", value: "AdapterEndpoint_t"}
    },
    path: {
      table: {
        type: {summary: "string | never", detail: "Cannot coexist with getLatestLogs"},
        category: "Mutually Exclusive",
        subcategory: "Endpoint"
      },
      type: {required: true, name: "string"}
    },
    getLatestLogs: {
      table: {
        type: {summary: "Function | never", detail: "Cannot coexist with endpoint or path"},
        category: "Mutually Exclusive",
        subcategory: "Function"
      },
      type: {required: true, name: "function"},
      control: false
    },
    refreshRate: {
      control: {type: "number"},
      table: {
        type: {summary: "number"}
      }
    },
    displayHeight: {
      control: {type: "text"},
      table: {
        type: {summary: "CSSProperties['height']",
          detail: "string | number"
        }
      }
    },
    maxLogs: {
      control: {type: "number"},
      table: {
        type: {summary: "number"}
      }
    },
    events: {
      table: {type: {summary: "Log[]"}}
    },
    justLogs: {
      control: {type: "boolean"},
      table: {type: {summary: "boolean"}}
    }
  }
} satisfies Meta<typeof OdinEventLog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithEndpoint: Story = {
  args: {
    path: "events",
    endpoint: PlaceholderEndpoint
  },
  render: (args) => <EventLogWithEndpoint {...args}/>,
}

export const WithMethod: Story = {
  args: {
    getLatestLogs: getEventLogs
  },
  argTypes: {
    endpoint: {
      table: {
        disable: true
      }
    },
    path: {
      table: {
        disable: true
      }
    }
  }
}

export const WithAsyncMethod: Story = {
  args: {
    getLatestLogs: getAsyncEventLogs
  },
  argTypes: {
    endpoint: {
      table: {
        disable: true
      }
    },
    path: {
      table: {
        disable: true
      }
    }
  }
}

export const WithoutLevel: Story = {
  args: {
    getLatestLogs: (timestamp: string) => {
      return getEventLogs(timestamp).map(({level, ...keepAttrs}) => keepAttrs)
    }
  }
}