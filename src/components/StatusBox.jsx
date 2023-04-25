import Alert from 'react-bootstrap/Alert';

import React from 'react';

function StatusBox({label, type, children})
{
    const fullText = label ? `${label}: ${children}` : children;

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