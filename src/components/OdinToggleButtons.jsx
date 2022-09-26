import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';

import React, { useState } from 'react';

function OdinToggleButtons(props) {
    const endpoint = props.endpoint;
    let path = "";
    let valueName = "";
    if(props.path.includes("/"))
    {
        [path, valueName] = props.path.split(/\/(.*)/, 2);
    }else{
        // const path = "";
        valueName = props.path;
    }
    

    const buttonList = props.buttons;

    const createButtons = buttonList.map((button) =>
        <ToggleButton id={button.id} variant='outline-primary' value={button.value}>
            {button.text}
        </ToggleButton>
    )

    const handleChange = (val) =>
    {
        const sendVal = {};
        sendVal[valueName] = val;
        console.log(sendVal);
        endpoint.put(sendVal, path);
    }

    return (
        <ToggleButtonGroup 
            type="radio" 
            name={props.name}
            defaultValue={buttonList[0].value}
            onChange={handleChange}>
            
            {createButtons}
        </ToggleButtonGroup>
    )
}

export default OdinToggleButtons;