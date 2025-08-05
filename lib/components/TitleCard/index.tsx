import type { PropsWithChildren, ReactNode } from 'react';
import { Card }from 'react-bootstrap';

import styles from './styles.module.css'

interface TitleCardProps extends PropsWithChildren{
    title?: ReactNode;
}
/**
 * A simple Card component with optional header, used to group similar Components together visually.
 */
const TitleCard: React.FC<TitleCardProps> = (props) => {
    const {title} = props;

    return (
        <Card className={styles.card}>
            {title != null && <Card.Header>{title}</Card.Header>}
            <Card.Body>{props.children}</Card.Body>
        </Card>
    )
}

export { TitleCard };