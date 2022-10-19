import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'


function DropdownSelector(props) {
    const { buttonText="Dropdown", variant="primary", id, children, onSelect=null} = props;
    return (
        <Dropdown onSelect={onSelect}>
            <Dropdown.Toggle variant={variant} id={id}>
                {buttonText}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {children}
            </Dropdown.Menu>

        </Dropdown>
    );
}

export default DropdownSelector;