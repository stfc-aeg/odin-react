import type { FC, PropsWithChildren, ReactNode } from 'react';
import { Card }from 'react-bootstrap';

import styles from './styles.module.css'

interface TitleCardProps extends PropsWithChildren{
    title?: ReactNode;
}

export const TitleCard: FC<TitleCardProps> = (props) => {
    const {title} = props;

    return (
        <Card style={styles}>
            {title != null && <Card.Header>{title}</Card.Header>}
            <Card.Body>{props.children}</Card.Body>
        </Card>
    )
}