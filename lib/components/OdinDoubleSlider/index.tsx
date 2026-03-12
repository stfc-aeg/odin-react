import React, { useState, useRef, useEffect } from "react";
import type { ComponentPropsWithRef } from "react";

import { OverlayTrigger, OverlayTriggerProps, Tooltip, InputGroup } from "react-bootstrap";

import style from './styles.module.css'


interface SliderProps extends ComponentPropsWithRef<"div">{
    min?: number;
    max?: number;
    value?: number[];
    step?: number;
    title?: string;
    onChange?: React.ChangeEventHandler<DivRef>;
    onMouseUp?: React.MouseEventHandler<HTMLInputElement>;
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
    const { show, children, ...leftoverProps } = props;
    if (show) return <OverlayTrigger {...leftoverProps}>{children}</OverlayTrigger>
    else return <>{children as React.ReactNode}</>

}

const OdinDoubleSlider: React.FC<SliderProps> = (props) => {

    const { min = 0, max = 100, step = 1, value = [min, max] } = props;
    const { title, showTooltip = true, tooltipPosition = "auto", disabled, showMinMaxValues = true } = props;
    const { onChange, onMouseUp } = props;

    const [vals, changeVals] = useState<value_t>({ low: value[0], high: value[1] });

    useEffect(() => {
        changeVals({ low: value[0], high: value[1] })
    }, [value[0], value[1]]);

    const divRef = useRef<DivRef>(null);

    const onSlide: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const id = event.target.id;
        const val = event.target.valueAsNumber;
        // let otherVal = val;
        let newLow = vals.low;
        let newHigh = vals.high;
        if (id == "left_slider") {
            newLow = val;
            if (newLow >= newHigh) {
                newHigh = val;
            }
        }
        else {
            newHigh = val;
            if (newHigh <= newLow) {
                newLow = val;
            }
        }
        changeVals({ low: newLow, high: newHigh });

        if (onChange != null) {
            // manually trigger the onChange event with the value from the two sliders
            const target = divRef.current!;
            target.value = [newLow, newHigh];
            const newEvent: React.ChangeEvent<DivRef> = Object.assign(
                event as unknown as React.ChangeEvent<DivRef>,
                {
                    target: target,
                    nativeEvent: event.nativeEvent
                });
            onChange(newEvent);
        }
    }

    const tooltip = (
        <Tooltip id="tooltip">
            {`${vals.low}, ${vals.high}`}
        </Tooltip>
    )

    const titleDiv = (
        <div className={style.dataList}>
            {showMinMaxValues ? <InputGroup.Text>{min}</InputGroup.Text> : <div />}
            {title != null ? <InputGroup.Text>{title}</InputGroup.Text> : <></>}
            {showMinMaxValues ? <InputGroup.Text>{max}</InputGroup.Text> : <div />}
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
                        min={min} max={max} step={step} value={vals.low} />
                    <input disabled={disabled} type="range" id="right_slider"
                        className={`${style.input} ${style.right}`}
                        onChange={onSlide} onMouseUp={onMouseUp}
                        min={min} max={max} step={step} value={vals.high} />
                </Div>
            </OptionalOverlay>
        </div>
    )
}

export { OdinDoubleSlider };