import usePeriodicFetch from '../services/usePeriodicFetch';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image'

import React from 'react';

function LiveImage(props)
{
    const {response: specImage} = usePeriodicFetch(props.path, props.adapter);
    console.log(specImage);
    return (
        <Card className='mb-4'>
            <Card.Header>{props.title}</Card.Header>
            <Card.Body>
            <Image src={specImage}>

            </Image>
            </Card.Body>
        </Card>
    );
}

export default LiveImage;