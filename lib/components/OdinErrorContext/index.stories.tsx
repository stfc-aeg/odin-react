import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from "react-bootstrap";

import { OdinErrorContext, OdinErrorOutlet, SingleErrorOutlet, useError } from './index';
import { Card, Row, Col, Button, InputGroup, Form, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useState } from 'react';


interface OverlayButtonProps extends ButtonProps {
  tooltipText: string
}
const OverlayButton = (rest: OverlayButtonProps) => {

  return (
    <OverlayTrigger overlay={<Tooltip>{rest.tooltipText}</Tooltip>}>
      <Button {...rest} />
    </OverlayTrigger>
  )
}

const ErrorContextDisplay = ({ }) => {

  const { errors, setError, clearError, clearAllError } = useError();

  const [ErrorText, changeErrorText] = useState("Demo Error!");

  const triggerNewError = () => {
    setError(new Error(ErrorText || "Demo Error!"));
  }

  const handleClearError = () => {
    const last_error = errors.at(0);

    if (last_error) {
      clearError(last_error);
    }

  }

  return (
    <Card>
      <SingleErrorOutlet />
      <Card.Header>
        Demo of useError Methods and Error Outlets
      </Card.Header>
      <Card.Header>
        <Row>
          <Col>
            <InputGroup>
              <InputGroup.Text>Error Message:</InputGroup.Text>
              <Form.Control value={ErrorText} onChange={
                (event) => changeErrorText(event.target.value)} />
              <OverlayButton onClick={triggerNewError}
              tooltipText='setError: adds a new OdinError to the list, or increments the counter on the most recent if the error messages are identical.'>
                Set Error
                </OverlayButton>
            </InputGroup>
          </Col>
          <Col>
            <ButtonGroup>
              <OverlayButton onClick={handleClearError} variant='warning'
              tooltipText='clearError: accepts an OdinError object to remove from the list.' >
                Clear Last Error
              </OverlayButton>
              <OverlayButton onClick={clearAllError} variant='danger'
              tooltipText='clearAllError: removes all errors from the list, leaving it empty.'>
                Clear All Error
              </OverlayButton>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Card>
          <Card.Header>Odin Error Outlet</Card.Header>
          <OdinErrorOutlet />
        </Card>
      </Card.Body>
    </Card>
  )
}

/**
 * A Custom Hook that provides Error Handling methods.
 * 
 * Shown are buttons that trigger the Error Handling methods provided,
 * and two displays that show the errors to the user.
 * `OdinErrorOutlet` and `SingleErrorOutlet`, which are used by `OdinApp`.
 * 
 * The hook returns three methods:
 * - setError: Adds a new OdinError to the list. If the messages matches the newest error,
 * instead increment that error's counter
 * - clearError: Remove a specific OdinError from the list.
 * - clearAllError: Removes all OdinErrors from the list.
 * 
 * `OdinErrorOutlet` shows as a list of all errors.
 * 
 * `SingleErrorOutlet` is a floating alert that temporarily appears to display
 * a new error.
 */
const meta = {
  title: "components/useError",
  component: ErrorContextDisplay,
  subcomponents: {OdinErrorOutlet, SingleErrorOutlet, OdinErrorContext},
  parameters: {
    docs: {
      source: {
        code: `const { errors, setError, clearError, clearAllError } = useError();`
      }
    }
  }
} satisfies Meta<typeof ErrorContextDisplay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};