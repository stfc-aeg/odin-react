import type { Metadata, ParamTree, Parameter } from "../AdapterEndpoint";
import { AdapterEndpoint, getValueFromPath, isMetadataValue, isParamNode } from "../AdapterEndpoint";
import { EndpointButton, EndpointCheckbox, EndpointDropdown, EndpointInput } from "../WithEndpoint";

import {  useState } from "react";
import { Card, Collapse, Dropdown, InputGroup, OverlayTrigger, Table, Tooltip } from "react-bootstrap";

import type { PropsWithChildren, ReactNode } from "react";

import Style from './styles.module.css';

interface CollapseableCardProps extends PropsWithChildren {
    header: ReactNode;
    defaultOpen?: boolean;
}

const CollapseableCard: React.FC<CollapseableCardProps> = (
    { header, defaultOpen = true, children }
) => {

    const [open, setOpen] = useState(defaultOpen);

    return (
        <Card>
            <Card.Header onClick={() => setOpen(oldVal => !oldVal)} className={Style.collapseHeader}>
                {header}
            </Card.Header>
            <Collapse in={open}>
                {/* div required for smooth transition */}
                <div>
                    <Card.Body>
                        {children}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}


interface ParamControllerProps {
    endpoint: AdapterEndpoint;
    path?: string;
    title?: string;
}


const ParamController: React.FC<ParamControllerProps> = (
    { endpoint, path = "", title }
) => {

    // const param: JSON = getValueFromPath(endpoint.data, path);
    const metadata: Metadata = getValueFromPath(endpoint.metadata, path)!;
    const param: ParamTree = getValueFromPath(endpoint.data, path)!;

    const name = title ?? (isMetadataValue(metadata) && metadata.name ?
        metadata.name : path.replace(/\/$/, "").split("/").pop() ?? "unknown");


    if (isMetadataValue(metadata) && metadata.allowed_values && !isParamNode(param)) {
        //we have a value with specific allowed values. Create a dropdown
        return (
            <InputGroup>
                <InputGroup.Text>{name}</InputGroup.Text>
                <EndpointDropdown endpoint={endpoint} fullpath={path}
                    title={String(param) || "Unknown"}>
                    {(metadata.allowed_values as Parameter[]).map(
                        (selection, index) => (
                            <Dropdown.Item eventKey={selection as string | number} key={index} active={selection == param}>
                                {selection as string | number}
                            </Dropdown.Item>
                        )
                    )}
                </EndpointDropdown>
            </InputGroup>
        )
    } else {

        switch (typeof param) {
            case "object":
                switch (true) {
                    case param == null:
                        return (
                            <OverlayTrigger overlay={<Tooltip id={name}>Value assumed to be True</Tooltip>}>
                                <EndpointButton endpoint={endpoint} fullpath={path} value={true}>
                                    {name}
                                </EndpointButton>
                            </OverlayTrigger>
                        )
                    case param instanceof Array:

                        return (
                            <CollapseableCard header={name}>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th colSpan={1000}>{name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(param as Parameter[]).map(
                                            (val, index) => (
                                                <tr>
                                                    <td>{index}</td>
                                                    {typeof val == "object" && val != null ?
                                                        Object.entries(val).map(
                                                            ([key, mapVal]) => (
                                                                <td id={key}>{`${key}: ${mapVal}`}</td>
                                                            )
                                                        )
                                                        :
                                                        <td>{String(val)}</td>
                                                    }
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </Table>
                            </CollapseableCard>
                        )
                    case isParamNode(param):
                    default:
                        return (
                            <CollapseableCard header={name}>
                                <div className="d-grid gap-2">
                                    {Object.keys(param).map((val, index) => (
                                        <ParamController
                                            key={index}
                                            endpoint={endpoint}
                                            path={path ? [path, val].join("/") : val}
                                        />
                                    ))}
                                </div>
                            </CollapseableCard>
                        )
                }
            case "boolean":  // Toggle Switch
                return (
                    <InputGroup>
                        <InputGroup.Text>{name}</InputGroup.Text>
                        <InputGroup.Text>
                            <EndpointCheckbox endpoint={endpoint} fullpath={path}
                                type="switch" />
                        </InputGroup.Text>
                    </InputGroup>
                )
            case "string":
            case "number":
                return (
                    <InputGroup>
                        <InputGroup.Text>{name}</InputGroup.Text>
                        <EndpointInput endpoint={endpoint} fullpath={path}
                            type={typeof param == "number" ? "number" : undefined}
                        />
                    </InputGroup>
                )
            default:
                return (
                    <p>{param as string | number}</p>
                )
        }
    }

}

export { ParamController };
