import { ReactNode } from 'react';
import Card from 'react-bootstrap/Card';

interface TitleCardProps {
    title: ReactNode;
    children: ReactNode;
}

export function TitleCard({title, children}: TitleCardProps) {

    return (
        <Card>
            <Card.Header>{title}</Card.Header>
            <Card.Body>{children}</Card.Body>
        </Card>
    )
}