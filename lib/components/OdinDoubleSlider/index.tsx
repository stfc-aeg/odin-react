import React, { useState, useRef, useEffect } from "react";
import type { ComponentPropsWithRef } from "react";

import { OverlayTrigger, OverlayTriggerProps, Tooltip, InputGroup } from "react-bootstrap";

import style from './styles.module.css'


interface SliderProps {
    min?: number;
    max?: number;
    value?: number[];
    step?: number;
    title?: string;
    onChange?: React.ChangeEventHandler;
    onKeyPress?: React.KeyboardEventHandler;
    showTooltip?: boolean;
    showMinMaxValues?: boolean;
    tooltipPosition?: OverlayTriggerProps["placement"];
    disabled?: boolean;

}

interface value_t {
    low: number;
    high: number;
}

interface DivProps extends ComponentPropsWithRef<"div"> {
    value?: number[];
}

interface DivRef extends HTMLDivElement {
    value?: number[];
}

const Div = (props: DivProps) => {

    return (
        <div {...props}>
            {props.children}
        </div>
    )
}

const OptionalOverlay = (props: OverlayTriggerProps) => {
    const {show, children, ...leftoverProps} = props;
    if(show) return <OverlayTrigger {...leftoverProps}>{children}</OverlayTrigger>
    else return <>{children as React.ReactNode}</>

}

export const OdinDoubleSlider: React.FC<SliderProps> = (props) => {

    const {min=0, max=100, step=1, value=[min, max]} = props;
    const {title, showTooltip=true, tooltipPosition="auto", disabled, showMinMaxValues=true} = props;
    const {onChange, onKeyPress} = props;

    const [vals, changeVals] = useState<value_t>({low: value[0], high: value[1]});

    useEffect(() => {
        changeVals({low: value[0], high: value[1]})
    }, [value[0], value[1]]);

    const divRef = useRef<DivRef>(null);

    const onSlide: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const id = event.target.id;
        const val = event.target.valueAsNumber;
        // let otherVal = val;
        let newLow = vals.low;
        let newHigh = vals.high;
        if(id == "left_slider"){
            newLow = val;
            if(newLow >= newHigh){
                newHigh = val;
            }
        }
        else{
            newHigh = val;
            if(newHigh <= newLow){
                newLow = val;
            }
        }
        changeVals({low: newLow, high: newHigh});

        if(onChange != null){
            // manually trigger the onChange event with the value from the two sliders
            const target = divRef.current!;
            target.value = [newLow, newHigh];
            const newEvent: React.ChangeEvent = Object.assign(event, 
            {
               target: target,
               nativeEvent: event.nativeEvent
                

            });
            onChange(newEvent);
        }
    }

    const onMouseUp: React.MouseEventHandler<HTMLInputElement> = (event) => {
        if(onKeyPress != null){
            // we gotta fake the Enter Key Press to allow this component to work with WithEndpoint
            const eventDetails: KeyboardEventInit = {};
            eventDetails.key = "Enter";
            eventDetails.shiftKey = false;
            const nativeEvent = new KeyboardEvent("keypress", eventDetails);
            const newEvent: React.KeyboardEvent = Object.assign(event, 
            {
                target: divRef.current!,
                nativeEvent: nativeEvent,
                key: "Enter",
                code: "Enter",
                charCode: 13,
                which: 13,
                keyCode: 0,
                locale: "undefined",
                location: 0,
                repeat: false

            });
            
            onKeyPress(newEvent);

        }
    }

    const tooltip = (
        <Tooltip id="tooltip">
            {`${vals.low}, ${vals.high}`}
        </Tooltip>
    )

    const titleDiv = (
        <div className={style.dataList}>
            {showMinMaxValues ? <InputGroup.Text>{min}</InputGroup.Text> : <div/>}
            {title != null ? <InputGroup.Text>{title}</InputGroup.Text> : <></>}
            {showMinMaxValues ? <InputGroup.Text>{max}</InputGroup.Text> : <div/>}
        </div>
    )
    return (
        <div>
            {titleDiv}
            <OptionalOverlay placement={tooltipPosition} overlay={tooltip} show={showTooltip}>
                <Div ref={divRef} value={[vals.low, vals.high]} className={style.div}>
                    <input disabled={disabled} type="range" id="left_slider"
                        className={`${style.input} ${style.left}`}
                        onChange={onSlide} onMouseUp={onMouseUp}
                        min={min} max={max} step={step} value={vals.low}/>
                    <input disabled={disabled} type="range" id="right_slider"
                    className={`${style.input} ${style.right}`}
                        onChange={onSlide} onMouseUp={onMouseUp}
                        min={min} max={max} step={step} value={vals.high}/>
                </Div>
            </OptionalOverlay>
        </div>
    )
}