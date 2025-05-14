import { TitleCard } from "../TitleCard";
import type {Log} from "../../types";
import {Row, Col, Stack} from 'react-bootstrap';
import { ToggleButtonGroup, ToggleButton, Form, InputGroup } from "react-bootstrap";


import style from './styles.module.css';
import { useState } from "react";


interface EventLogProps {
    events: Log[];
    timestamp_start?: (timestamp: string) => null;
    timestamp_end?: (timestamp: string) => null;

};

export const OdinEventLog: React.FC<EventLogProps> = (props) => {

    const {events, timestamp_start, timestamp_end} = props;

    const log_levels = ["debug", "info", "warning", "error", "critical"];
    const log_variants: {[key: string]: string} = {debug: "secondary", info: "success", warning: "warning", error: "danger", critical: "danger"};
    
    const [level_filter, setLevelFilter] = useState(log_levels);
    const [displayDay, changeDisplayDay] = useState(true);
    const [filterStart, changeFilterStart] = useState("");
    const [filterEnd, changeFilterEnd] = useState("");

    const renderEvent = (event: Log) => {
        const event_level_class = "log-" + event.level;
        const date = new Date(event.timestamp);
        const formatter = new Intl.DateTimeFormat("en-UK", {
            dateStyle: "short"
        });
        const dateString = formatter.format(date);
        const timeString = `${date.getHours().toLocaleString("en-UK", {minimumIntegerDigits: 2})}:${date.getMinutes().toLocaleString("en-UK", {minimumIntegerDigits: 2})}:${date.getSeconds().toLocaleString("en-UK", {minimumIntegerDigits: 2})}.${date.getMilliseconds()}`

        const displayDatetimeString = displayDay ? `${dateString}, ${timeString}` : timeString;

        return (
            <Row key={event.timestamp} className={`${style.log} ${style[event_level_class]}`}>
                <Col xs="auto" className={`${style["log-left"]} ${style[event_level_class]}`}>{displayDatetimeString} : {event.level.padStart(8)} :</Col><Col>{event.message}</Col>
            </Row>
        )
    }

    const onFilterChange = (val: string[]) => setLevelFilter(val);

    const onTimestampChange = (event: React.ChangeEvent, func: EventLogProps["timestamp_start"]) => {
        let target = event.target as HTMLInputElement;
        let val = target.value;
        console.debug(event);
        if(func){func(val)}else{
            console.debug("No function defined. Manual filtering");
            let id = target.id;
            if(id === "timestampStart"){
                changeFilterStart(val);
            }else{
                changeFilterEnd(val);
            }

        };
    }

    const filterButtons = () => {

        return (
            <Row>
            <Col xs={6} style={{textAlign: "center", alignContent: "center"}}>Event Log</Col>
            <Col className="me-auto">
            <ToggleButtonGroup type="checkbox" size="sm" value={level_filter} onChange={onFilterChange}>
                {log_levels.map((level) => (
                    <ToggleButton key={level}  id={level} value={level} variant={`outline-${log_variants[level]}`}>{level}</ToggleButton>
                ))}
            </ToggleButtonGroup>
            </Col>
            <Col style={{alignContent: "center" }}>
            <Form.Switch reverse label="Display Date" id="showDate" checked={displayDay} onChange={() => changeDisplayDay(val => !val)}/>
            </Col>
            </Row>
        )
    }
    const EventList = () => {
        const filteredLogs = events.filter((event) => {
            let level_filtered = level_filter.includes(event.level);
            let timestamp = new Date(event.timestamp);
            let timestamp_filtered_start = filterStart ? timestamp >= new Date(filterStart) : true;
            let timestamp_filtered_end = filterEnd ? timestamp <= new Date(filterEnd) : true;
            return (level_filtered && timestamp_filtered_start && timestamp_filtered_end);
        });
        return (
            filteredLogs.map((event) => renderEvent(event))
        )
    }
    return (
        <TitleCard title={filterButtons()}>
        <Stack gap={2}>
        {/* <Col> */}
            <div className={style["pre-scrollable"]}>
                {EventList()}
            </div>
        {/* </Col>
        <Col> */}
        <InputGroup>
            <InputGroup.Text>Filter logs between timestamp:</InputGroup.Text>
            <Form.Control step="1" id="timestampStart" type="datetime-local" onChange={(event) => onTimestampChange(event, timestamp_start)}/>
            <InputGroup.Text>and</InputGroup.Text>
            <Form.Control id="timestampEnd" type="datetime-local" onChange={(event) => onTimestampChange(event, timestamp_end)}/>
        </InputGroup>
        {/* </Col> */}
        </Stack>
        </TitleCard>
    )
}