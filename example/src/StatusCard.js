import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import {OdinCard, StatusBox} from 'odin-react';

import React, { useState } from 'react';

function StatusLabelRow(props)
{
  const statuses = props.statuses;
  const listStatuses = statuses.map((statusVal) =>
    <Col>
      <Alert key={statusVal.id} variant={statusVal.variant}>
        {statusVal.text}
      </Alert>
    </Col>
  )

  return (
    <>
    {listStatuses}
    </>
  );
}

function StatusCard(props) {
  const allStatuses = props.statuses;
  const alStates = props.states;
  const listAllStatuses = allStatuses.map((statusRow) =>
    <Row>
        <StatusLabelRow statuses={statusRow}/>
    </Row>
  )
  const [state, changeState] = useState(true);

  return (
    <OdinCard title={props.title}>
      {listAllStatuses}
    </OdinCard>
  );
}


export default StatusCard;