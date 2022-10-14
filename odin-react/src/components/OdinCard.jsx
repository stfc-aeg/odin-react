import Card from 'react-bootstrap/Card';

import React from 'react';

function OdinCard({title, children}) {

    return (
        <Card className='mb-4'>
            <Card.Header>{title}</Card.Header>
            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    );
}

export default OdinCard;