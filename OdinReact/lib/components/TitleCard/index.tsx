import { FC, ReactNode } from 'react';
import Card from 'react-bootstrap/Card';

import styles from './styles.module.css'

interface TitleCardProps {
    title: ReactNode;
    children: ReactNode;
}

export const TitleCard: FC<TitleCardProps> = ({title, children}: TitleCardProps) => {

    return (
        <Card style={styles}>
            <Card.Header>{title}</Card.Header>
            <Card.Body>{children}</Card.Body>
        </Card>
    )
}