import Card from 'react-bootstrap/Card';

import React from 'react';

function TitleCard({title, children}) {

    return (
        <Card className='mb-4'>
            <Card.Header>{title}</Card.Header>
            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    );
}

export default TitleCard;