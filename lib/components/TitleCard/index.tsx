import type { PropsWithChildren, ReactNode } from 'react';
import { Card }from 'react-bootstrap';

import styles from './styles.module.css'

interface TitleCardProps extends PropsWithChildren{
    /** What to display in the card Header */
    title?: ReactNode;
}

/**
 * A simple Card component with optional header, used to group similar Components together visually.
 */
const TitleCard = ({title, children}: TitleCardProps) => {
    // const {title} = props;

    return (
        <Card className={styles.card}>
            {title != null && <Card.Header>{title}</Card.Header>}
            <Card.Body>{children}</Card.Body>
        </Card>
    )
}

export { TitleCard };