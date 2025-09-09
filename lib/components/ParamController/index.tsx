import { AdapterEndpoint_t, getValueFromPath, isParamNode } from "../AdapterEndpoint";
import { TitleCard } from "../TitleCard";
import type { NodeJSON, JSON } from "../AdapterEndpoint";
import { trimByChar, WithEndpoint } from "../WithEndpoint";

import { useMemo } from "react";
import { Button, Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";


interface ParamControllerProps {
    endpoint: AdapterEndpoint_t;
    path?: string;
    title?: string;
}
 
type ValType =  "string" | "number" | "boolean" | "null" | "list" | "dict";

const EndpointInput = WithEndpoint(Form.Control);
const EndpointCheckbox = WithEndpoint(Form.Switch);
const EndpointButton = WithEndpoint(Button);

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

    const {param, ParamType} = useMemo(() => {
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

        return {param, ParamType: type};

    },
    [endpoint.metadata, endpoint.updateFlag, path]);




    switch (ParamType) {
        case "dict":
            return (
                <TitleCard title={name}>
                    {Object.keys(param as NodeJSON).map((val, index) => (
                        <ParamController
                            key={index}
                            endpoint={endpoint}
                            path={path ? [path, val].join("/") : val}
                            title={val}
                        />
                    ))}
                </TitleCard>
            )
        case "boolean":
            return (
                <InputGroup>
                    <InputGroup.Text>{name}</InputGroup.Text>
                    <EndpointCheckbox endpoint={endpoint} fullpath={path}
                        type="switch"/>
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
                <div className="d-grid">
                    <OverlayTrigger overlay={<Tooltip id={name}>Value assumed to be True</Tooltip>}>
                    <EndpointButton endpoint={endpoint} fullpath={path} value={true}>
                        {name}
                    </EndpointButton>
                    </OverlayTrigger>
                </div>
            )
        case "list":
            return (
                <></>
            )
        default:
            return (
                <p>{param as string | number}</p>
            )
    }

}
 
export  {ParamController } ;