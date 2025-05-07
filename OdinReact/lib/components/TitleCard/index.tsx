import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Card }from 'react-bootstrap';

import styles from './styles.module.css'

interface TitleCardProps extends PropsWithChildren<{}>{
    title: ReactNode;
}

export const TitleCard: FC<TitleCardProps> = ({title, children}: TitleCardProps) => {

    return (
        <Card style={styles}>
            <Card.Header>{title}</Card.Header>
            <Card.Body>{children}</Card.Body>
        </Card>
    )
}