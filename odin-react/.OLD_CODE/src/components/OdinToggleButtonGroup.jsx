import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

import React from 'react';

function OdinToggleButtonGroup(props) {
    const {children, onChangeHandler, name, defaultValue} = props;

    return (
        <ToggleButtonGroup
            type="radio"
            defaultValue={defaultValue}
            onChange={onChangeHandler}
            name={name}
        >
            {children}
        </ToggleButtonGroup>
    )
}

export default OdinToggleButtonGroup;