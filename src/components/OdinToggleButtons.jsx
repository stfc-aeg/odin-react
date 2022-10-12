import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import OdinToggleButtonGroup from './OdinToggleButtonGroup';

import React from 'react';

function OdinEndpointToggleButtons(props) {
    const endpoint = props.endpoint;
    let path = "";
    let valueName = "";
    if(props.path.includes("/"))
    {
        [path, valueName] = props.path.split(/\/(?!.*\/)(.*)/, 2);
    }else{
        // const path = "";
        valueName = props.path;
    }
    

    const buttonList = props.buttons;

    const createButtons = buttonList.map((button) =>
        <ToggleButton key={button.id} variant='outline-primary' value={button.value}>
            {button.text}
        </ToggleButton>
    )

    const handleChange = (val) =>
    {
        const sendVal = {[valueName]: val};
        // sendVal[valueName] = val;
        console.log(sendVal);
        endpoint.put(sendVal, path);
    }

    return (
        <OdinToggleButtonGroup onChangeHandler={handleChange} name={props.name} defaultValue={buttonList[0].value}>
            
            {createButtons}
        </OdinToggleButtonGroup>
    )
}

export default OdinEndpointToggleButtons;