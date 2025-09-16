import { AdapterEndpoint_t, getValueFromPath, isParamNode } from "../AdapterEndpoint";
import { TitleCard } from "../TitleCard";
import type { NodeJSON, JSON } from "../AdapterEndpoint";
import { trimByChar, WithEndpoint } from "../WithEndpoint";

import { useMemo } from "react";
import { Button, Form, InputGroup, OverlayTrigger, Tooltip, DropdownButton, Dropdown, Table } from "react-bootstrap";


interface ParamControllerProps {
    endpoint: AdapterEndpoint_t;
    path?: string;
    title?: string;
}
 
type ValType =  "string" | "number" | "boolean" | "null" | "list" | "dict";

const EndpointInput = WithEndpoint(Form.Control);
const EndpointCheckbox = WithEndpoint(Form.Switch);
const EndpointButton = WithEndpoint(Button);
const EndpointDropdown = WithEndpoint(DropdownButton);

const ParamController: React.FC<ParamControllerProps> = (
    {endpoint, path="", title}
) => {

    // const param: JSON = getValueFromPath(endpoint.data, path);

    const name: string = useMemo(() => {
        console.log(path);
        if(title) return title;

        let valName = trimByChar(path, "/");
        if(valName.includes("/")){
            valName = valName.split(/\/(?!.*\/)(.*)/, 2)[-1]
        }
        return valName;
    }, [path]);

    const {param, ParamType, metadata} = useMemo(() => {
        const metadata = getValueFromPath<JSON>(endpoint.metadata, path);
        const param: JSON = getValueFromPath<JSON>(endpoint.data, path);
        let type: ValType;

        const rawType = isParamNode(metadata) && "writeable" in metadata ? 
            metadata.type as string : typeof param;
        
        
        switch(rawType){
            case "int":
            case "float":
            case "complex":
            case "bigint":
            case "number":
                type = "number";
                break;
            case "list":
            case "tuple":
            case "range":
                type = "list";
                break;
            case "bool":
            case "boolean":
                type = "boolean";
                break;
            case "str":
            case "string":
                type = "string";
                break;
            case "NoneType":
            case "function":
            case "symbol":
            case "undefined":
                type = "null";
                break;
            case "object":
                switch(true){
                    case param instanceof Array:
                        type = "list";
                        break;
                    case param == null:
                        type = "null";
                        break;
                    default:
                        type = "dict"
                        break;
                }
                break;
            default:
                type = rawType as ValType;
                break;
        }

        return {param, ParamType: type, metadata};

    },
    [endpoint.metadata, endpoint.updateFlag, path]);


    if(isParamNode(metadata) && "allowed_values" in metadata){
        type selectType = string | number;
        return (
            <InputGroup>
            <InputGroup.Text>{name}</InputGroup.Text>
            <EndpointDropdown endpoint={endpoint} fullpath={path}
                title={param || "Unknown"}>
                    {(metadata.allowed_values as JSON[]).map(
                        (selection, index) => (
                            <Dropdown.Item eventKey={selection as selectType} key={index} active={selection == param}>
                                {selection as selectType}
                            </Dropdown.Item>
                        )
                    )}
            </EndpointDropdown>
            </InputGroup>
        )
    }else{

        switch (ParamType) {
            case "dict": // recursily create more Param Controller controls within a TitleCard
                return (
                    <TitleCard title={name}>
                        <div className="d-grid gap-2">
                        {Object.keys(param as NodeJSON).map((val, index) => (
                            <ParamController
                                key={index}
                                endpoint={endpoint}
                                path={path ? [path, val].join("/") : val}
                                title={val}
                            />
                        ))}
                        </div>
                    </TitleCard>
                )
            case "boolean":  // Toggle Switch
                return (
                    <InputGroup>
                        <InputGroup.Text>{name}</InputGroup.Text>
                        <InputGroup.Text>
                        <EndpointCheckbox endpoint={endpoint} fullpath={path}
                            type="switch"/>
                        </InputGroup.Text>
                    </InputGroup>                    
                )
            case "string":
            case "number":
                return (
                    <InputGroup>
                        <InputGroup.Text>{name}</InputGroup.Text>
                        <EndpointInput endpoint={endpoint} fullpath={path}
                            type={ParamType == "number" ? "number" : undefined}
                        />
                    </InputGroup>
                )
            case "null":
                return (
                    <OverlayTrigger overlay={<Tooltip id={name}>Value assumed to be True</Tooltip>}>
                        <EndpointButton endpoint={endpoint} fullpath={path} value={true}>
                            {name}
                        </EndpointButton>
                    </OverlayTrigger>
                )
            case "list":  // render a table? do we need to worry about if its editable? I dont think list Params are editable
                return (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th colSpan={1000}>{name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(param as JSON[]).map(
                                (val, index) => (
                                    <tr>
                                        <td>{index}</td>
                                        {typeof val == "object" && val != null ?
                                            Object.entries(val).map(
                                                ([key, mapVal]) => (
                                                    <td>{`${key}: ${mapVal}`}</td>
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
                )
            default:
                return (
                    <p>{param as string | number}</p>
                )
        }
    }

}
 
export  {ParamController } ;