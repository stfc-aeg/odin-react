import type { PropsWithChildren, ReactNode } from 'react';
import { Card }from 'react-bootstrap';

import styles from './styles.module.css'

interface TitleCardProps extends PropsWithChildren{
    title?: ReactNode;
}
/**
 * TEST DOC STRING HELLO
 * @param props 
 * @returns 
 */
export const TitleCard: React.FC<TitleCardProps> = (props) => {
    const {title} = props;

    return (
        <Card className={styles.card}>
            {title != null && <Card.Header>{title}</Card.Header>}
            <Card.Body>{props.children}</Card.Body>
        </Card>
    )
}