import React, { useRef, useState } from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import styles from '../style/slider.css'
// import FormRange from 'react-bootstrap/esm/FormRange';


function OdinDoubleSlider({
    min=0, max=100, steps=1,
    low = min, high= max,
    title="Range",
    onChange=null,
    showTooltip=true,
    tooltipPosition="top",
    showTitle=true,
    showMinMaxLabels=true})
{
    const [low_val, changeLowVal] = useState(low);
    const [high_val, changeHighVal] = useState(high);

    const divRef = useRef(null);

    const onThumbChange = (event) => {
        //this event triggers when the mouse is released
        // onSlide(event);
        console.log("Slider Vals: [%f, %f]", low_val, high_val);
        // console.log(event);
        if(typeof onChange === "function"){
            event.target = divRef.current;
            event.target.value = [low_val, high_val];
            onChange(event);
        }
    }

    const onSlideLeft = (event) => {
            // console.log("Lower Val: %d", event.target.value);
            changeLowVal(+event.target.value);
            

            if(+event.target.value >= high_val)
            {
                changeHighVal(event.target.value);
            }
    }

    const onSlideRight = (event) => {
        changeHighVal(+event.target.value);
        if(+event.target.value <= low_val)
        {
            changeLowVal(event.target.value);
        }
    }

    const tooltip = (
        <Tooltip id='tooltip'>
            {new String(`${low_val}, ${high_val}`)}
        </Tooltip>
    )

    return (
        <div>
            {showTitle && <div style={{textAlign: "center"}}>{title}</div>}
            <OverlayTrigger placement={tooltipPosition} overlay={showTooltip ? (tooltip) : (<span></span>)}>
                <div ref={divRef} class={styles.form_range_double_div} value={[low_val, high_val]}>
                    <input type="range" id="left_slider" className={styles.form_range_double + ' ' + styles.left}
                        onMouseUp={onThumbChange} onChange={onSlideLeft}
                        min={min} max={max} step={steps} defaultValue={low} value={low_val} list='values'/>
                    <input type="range" id="right_slider" class={styles.form_range_double + ' ' + styles.right}
                        onMouseUp={onThumbChange} onChange={onSlideRight}
                        min={min} max={max} step={steps} defaultValue={high} value={high_val} list='values'/>
                    {showMinMaxLabels && <datalist id='values' class={styles.form_range_double_datalist}>
                        <option value={min} label={min}/>
                        <option value={max} label={max}/>
                    </datalist>
                    }
                </div>
            </OverlayTrigger>
        </div>
    )

}

export default OdinDoubleSlider;