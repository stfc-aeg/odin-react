import { TitleCard } from "../TitleCard";
import type {AdapterEndpoint_t, NodeJSON} from "../AdapterEndpoint";
import {Row, Col } from 'react-bootstrap';
import { ToggleButtonGroup, ToggleButton, Form, InputGroup, Button, OverlayTrigger, Popover } from "react-bootstrap";

import { DashCircle, InfoCircle, ExclamationTriangle, ExclamationOctagon, XOctagon } from "react-bootstrap-icons";
import { Filter, Clock, CalendarEvent, ArrowBarDown } from "react-bootstrap-icons";

import style from './styles.module.css';
import { useEffect, useState, CSSProperties, useRef, useMemo, useCallback } from "react";

interface Log extends NodeJSON {
    level?: "debug" | "info" | "warning" | "error" | "critical";
    timestamp: string;
    message: string;
}

interface LogHeaderProps {
    displayLogLevels: boolean;
    displayDay: boolean;
    LogLevelFilter: string[];
    autoScroll: boolean;
    changeDisplayDay: React.Dispatch<React.SetStateAction<boolean>>;
    onFilterChange: (val: string[]) => void;
    changeAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
    changeTimestampFilter: React.Dispatch<React.SetStateAction<TimestampFilter_t>>;

}

interface TimestampFilter_t {
    start: Date;
    end: Date;
}

interface BasicProps {
    events: Log[];
    refreshRate?: number;
    displayHeight?: CSSProperties['height'];
    maxLogs?: number;
};

interface PropsWithMethod extends BasicProps {
    getLatestLogs: (timestamp: string) => Log[];
    endpoint?: never;
    path?: never;
}

interface PropsWithEndpoint extends BasicProps {
    getLatestLogs?: never;
    endpoint: AdapterEndpoint_t;
    path: string;
}

type EventLogProps = PropsWithMethod | PropsWithEndpoint;

const FilterButtons = (props: LogHeaderProps) => {

    const {displayLogLevels, displayDay, LogLevelFilter, autoScroll,
           changeDisplayDay, changeAutoScroll, onFilterChange, changeTimestampFilter} = props;

    const startDateInput = useRef<HTMLInputElement>(null);
    const startTimeInput = useRef<HTMLInputElement>(null);

    const endDateInput = useRef<HTMLInputElement>(null);
    const endTimeInput = useRef<HTMLInputElement>(null);

    // Canadian localisation matches the string formatting we need (YYYY-MM-DD), hence the 'en-CA'
    const todayString = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

    const combineDateandTime = (date: Date, time: Date) => {
        date.setHours(time.getUTCHours());
        date.setMinutes(time.getUTCMinutes());
        date.setSeconds(time.getUTCSeconds());
        date.setMilliseconds(time.getUTCMilliseconds());

        return date;

    }

    const onTimestampChange = (event: React.ChangeEvent) => {
        console.debug(event);
        const target = event.target as HTMLInputElement;
        let val = new Date();
        const zeroDate = new Date(0, 0);
        
        switch(target) {
            case startDateInput.current:
                val = combineDateandTime(target.valueAsDate ?? val,
                    startTimeInput.current?.valueAsDate ?? zeroDate);
                changeTimestampFilter(oldDates => ({start: val, end: oldDates.end}));
                break;
            case startTimeInput.current:
                val = combineDateandTime(startDateInput.current?.valueAsDate ?? val,
                    target.valueAsDate ?? zeroDate);
                changeTimestampFilter(oldDates => ({start: val, end: oldDates.end}));
                break;
            case endDateInput.current:
                val = combineDateandTime(target.valueAsDate ?? val,
                    endTimeInput.current?.valueAsDate ?? zeroDate);
                changeTimestampFilter(oldDates => ({start: oldDates.start, end: val}));
                break;
            case endTimeInput.current:
                val = combineDateandTime(endDateInput.current?.valueAsDate ?? val,
                    target.valueAsDate ?? zeroDate);
                changeTimestampFilter(oldDates => ({start: oldDates.start, end: val}));
                break;
        }
    }
    
    const renderOptions = (
        <Popover>
            <Popover.Header>Options</Popover.Header>
            <Popover.Body>
            {displayLogLevels ?
            <>
            <Row className={style.headerControl}>
                <Col>
                    <Form.Label>Filter Log Levels</Form.Label>
                    <ToggleButtonGroup type="checkbox" value={LogLevelFilter} onChange={onFilterChange}>
                        <ToggleButton className={style.iconButton} key="debug"  id="debug" value="debug" variant="outline-secondary"><DashCircle className={style.svg} title="Debug"/></ToggleButton>
                        <ToggleButton className={style.iconButton} key="info"  id="info" value="info" variant="outline-success"><InfoCircle className={style.svg} title="Info"/></ToggleButton>
                        <ToggleButton className={style.iconButton} key="warning"  id="warning" value="warning" variant="outline-warning"><ExclamationTriangle className={style.svg} title="Warning"/></ToggleButton>
                        <ToggleButton className={style.iconButton} key="error"  id="error" value="error" variant="outline-danger"><ExclamationOctagon className={style.svg} title="Wrror"/></ToggleButton>
                        <ToggleButton className={style.iconButton} key="critical"  id="critical" value="critical" variant="outline-danger"><XOctagon className={style.svg} title="Critical"/></ToggleButton>
                    </ToggleButtonGroup>
                </Col>
            </Row>
            <hr/>
            </>
            : <></>}
            <Form.Label>Filter Log Timestamps</Form.Label>
            <InputGroup size="sm">
                <InputGroup.Text>From</InputGroup.Text>
                <Form.Control ref={startDateInput} type="date" onChange={onTimestampChange} defaultValue={todayString}/>
                <Form.Control ref={startTimeInput} type="time" onChange={onTimestampChange} step="1"/>
            </InputGroup>
            <InputGroup size="sm">
                <InputGroup.Text>To</InputGroup.Text>
                <Form.Control ref={endDateInput} type="date" onChange={onTimestampChange} defaultValue={todayString}/>
                <Form.Control ref={endTimeInput} type="time" onChange={onTimestampChange} step="1"/>
            </InputGroup>
            </Popover.Body>
        </Popover>
    )

    return (
        <Row className={style.headerControl}>
        <Col>Event Log</Col>
        <Col xs="auto">
            <OverlayTrigger placement="bottom-end" overlay={renderOptions} trigger="click" rootClose>
            <Button className={style.iconButton} variant="outline-secondary"><Filter className={style.svg} title="Filter Options"/></Button>
            </OverlayTrigger>
            <Button className={style.iconButton} onClick={() => changeAutoScroll(val => !val)}
                    variant={autoScroll ? "secondary" : "outline-secondary"}>
                <ArrowBarDown className={style.svg} title={autoScroll ? "Disable Auto Scroll" : "Enable Auto Scroll"}/>
            </Button>
            <Button className={style.iconButton} onClick={() => changeDisplayDay(val => !val)} 
                    variant={displayDay ? "secondary" : "outline-secondary"}>
                {displayDay ? <Clock className={style.svg} title="Hide Date"/> :
                              <CalendarEvent className={style.svg} title="Show Date"/>}
            </Button>
        </Col>
        
        
        </Row>
    )
}

const OdinEventLog: React.FC<EventLogProps> = (
    { refreshRate=1000, getLatestLogs, endpoint, path, displayHeight="330px", maxLogs=500, events }
) => {

    // const { refreshRate=1000, getLatestLogs, endpoint, path, displayHeight="330px", maxLogs=500 } = props;

    const log_levels = ["debug", "info", "warning", "error", "critical"];

    const [level_filter, setLevelFilter] = useState(log_levels);
    //timestamp boundaries set as min and max possible dates to start with
    const [timestampFilter, changeTimestampFilter] = useState<TimestampFilter_t>({start: new Date(0), end: new Date(8.64e15)});
    const [stateEvents, changeEvents] = useState(events);
    const [lastTimestamp, changeLastTimestamp] = useState("");

    const [displayDay, changeDisplayDay] = useState(false);
    const [autoScroll, changeAutoScroll] = useState(true);

    const displayLogLevels = stateEvents[0] ? "level" in stateEvents[0] : false;

    const dateFormatter = new Intl.DateTimeFormat("en-UK", {
        dateStyle: "short"
    });
    const timeFormatter = new Intl.DateTimeFormat("en-UK", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    const RefreshLogs = useCallback(async () => {
        let newLogs: Log[] = [];
        if(getLatestLogs != null){
            newLogs = getLatestLogs(lastTimestamp);
        }else{
            // get the latest logs from the endpoint manually
           const response = await endpoint.get(`${path}?timestamp=${lastTimestamp}`);
           newLogs = Object.values(response)[0] as Log[];
        }
        if(newLogs.length){
            const lastLog = newLogs[newLogs.length -1];
            changeLastTimestamp(lastLog.timestamp);
            changeEvents(oldEvents => oldEvents.concat(newLogs).slice(-maxLogs));
        }

    }, [lastTimestamp, stateEvents, getLatestLogs]);

    useEffect(() => {
        if(autoScroll){
            const bottomDiv = scrollRef.current!;
            const options: ScrollToOptions = {behavior: "smooth", top: bottomDiv.offsetTop};
            bottomDiv.parentElement!.scrollTo(options);
        }
    }, [stateEvents]);

    useEffect(() => {
        const timer_id = setInterval(RefreshLogs, refreshRate);

        return () => {
            clearInterval(timer_id);
        }
    }, [refreshRate, RefreshLogs]);

    const renderEvent = (event: Log) => {
        const event_level_class = event.level ? event.level.toLowerCase() : "debug";
        const date = new Date(event.timestamp);
        const dateString = dateFormatter.format(date);
        const timeString = `${timeFormatter.format(date)}.${date.getMilliseconds().toString().padStart(3, "0")}`;
        const dateTimeString = displayDay ? `${dateString} ${timeString}` : timeString;
        // const logLeftString = event.level ? `${displayDatetimeString} : ${event.level.padStart(8)}` : displayDatetimeString;

        return (
            <Row key={event.timestamp} className={`${style.log} ${style[event_level_class]}`}>
                <Col sm="12" md="auto">{dateTimeString}</Col>
                {event.level ? 
                <Col xs="auto">{event.level.padStart(8)}</Col> : <></>}
                <Col>{event.message}</Col>
            </Row>
        )
    }

    const onFilterChange = (val: string[]) => setLevelFilter(val);
    
    const filterEvent = () => {
        const filteredLogs = stateEvents.filter((event) => {
            const level_filtered = event.level ? level_filter.includes(event.level.toLowerCase()) : true;
            const timestamp = new Date(event.timestamp);
            const timestamp_filtered_start = timestamp >= timestampFilter.start;
            const timestamp_filtered_end = timestamp < timestampFilter.end;
            return (level_filtered && timestamp_filtered_start && timestamp_filtered_end);
        });
        return filteredLogs;
    }


    return (
        <TitleCard title={<FilterButtons
            displayLogLevels={displayLogLevels} displayDay={displayDay} LogLevelFilter={level_filter} autoScroll={autoScroll}
            changeDisplayDay={changeDisplayDay} onFilterChange={onFilterChange} changeAutoScroll={changeAutoScroll} changeTimestampFilter={changeTimestampFilter}/>
        }>
            <div className={style.preScrollable} style={{height: displayHeight}}>
                {filterEvent().map((log) => renderEvent(log))}
                <div className="scrollToBottom" ref={scrollRef}/>
            </div>
        </TitleCard>
    )
}

export type { Log };
export { OdinEventLog };