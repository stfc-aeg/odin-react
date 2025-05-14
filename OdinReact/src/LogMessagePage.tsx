import {Container, Row, Col } from 'react-bootstrap';

import { OdinEventLog, TitleCard } from '../';
import type { Log } from '../';


export const LogMessagePage = () => {

    const multiLineMessage = `A Log Message that spans
multiple lines
for some reason. Also this line is very very long to see what the display does if a message extends past its standard length. Does it scroll? does it wrap? only time will tell.
either way, here's the fourth line`;

    const scriptingMessage = "testing if the inputs are <b>CLEAN</b>";

    const log_messages: Log[] = [
        {level: "debug", timestamp: new Date(Date.now()).toISOString(), message: "Test Debug"},
        {level: "info", timestamp: new Date(Date.now() + 30000).toISOString(), message: "Test Info"},
        {level: "warning", timestamp: new Date(Date.now() + 40000).toISOString(), message: "Test Warning"},
        {level: "error", timestamp: new Date(Date.now() + 45000).toISOString(), message: "Test Error"},
        {level: "error", timestamp: new Date(Date.now() + 46000).toISOString(), message: "Second Test Error"},
        {level: "critical", timestamp: new Date(Date.now() + 48000).toISOString(), message: "Test Critical"},
        {level: "info", timestamp: new Date(Date.now() + 50000).toISOString(), message: multiLineMessage},
        {level: "warning", timestamp: new Date(Date.now() + 120000).toISOString(), message: scriptingMessage}
    ]

    return (
        <Container>
            <OdinEventLog events={log_messages}/>
        </Container>
    )
}