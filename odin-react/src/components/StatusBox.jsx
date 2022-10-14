import Alert from 'react-bootstrap/Alert';

import React from 'react';

function StatusBox({label, text, type})
{
    const fullText = label ? `${label}: ${text}` : text;

    if(type == null)
    {
        type = 'success';
    }

    return (
        <Alert variant={type}>
            {fullText}
        </Alert>
    )
}

export default StatusBox;