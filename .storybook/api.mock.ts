import { HttpResponse, JsonBodyType } from "msw";
import { action } from 'storybook/actions';
import { isMetadataValue, isParamNode, type Metadata, type ParamNode, type ParamTree } from "../lib/components/AdapterEndpoint";
import { MetadataValue } from "../lib/components/AdapterEndpoint/AdapterEndpoint.types";

// import { createMetadata } from "./stories.mock";

const getMetaType = (param: ParamTree): MetadataValue["type"] => {
    switch (typeof param) {
        case "number":
        case "bigint":
            return Number.isInteger(param) ? "int" : "float";
        case "boolean":
            return "bool";
        case "object":
            return Array.isArray(param) ? "list" : isParamNode(param) ? "dict" : "NoneType";
        default:
            return "str";
    }
}



const createMetadata = <T extends ParamNode>(data: T, overrides?: { [key: string]: Partial<MetadataValue> }): Metadata<T> => {
    const return_data: { [key: string]: Metadata | MetadataValue } = {};

    for (const [key, val] of Object.entries(data)) {
        if ((overrides && key in overrides) || !isParamNode(val)) {
            const meta = overrides?.[key] ?? {};

            const metadata: MetadataValue = Object.assign(meta, {
                value: val,
                writeable: meta["writeable"] ?? true,
                type: meta["type"] ?? getMetaType(val)
            });
            return_data[key] = metadata;
        } else {
            return_data[key] = createMetadata(val, overrides);
        }
    }

    return return_data as Metadata<T>;
}

type ErrorCause = "read_only" | "type_mismatch" | "allowed_value" | "minimum" | "maximum";

interface HttpAdapter {
    get_response(path?: string[], wantsMetadata?: boolean): HttpResponse<JsonBodyType>;
    put_response(data: ParamNode, path?: string[]): HttpResponse<JsonBodyType>
}

interface BaseAdapter {
    get(path?: string[], wantsMetadata?: boolean): ParamTree;
    put(data: ParamTree, path?: string[]): void;
}

class AdapterError extends Error {
    reason: ErrorCause;
    constructor(msg: string, cause: ErrorCause) {
        super(msg);
        this.reason = cause;
    }
}

class BaseMockAdapter<T extends ParamNode> implements BaseAdapter {
    name: string;
    data: T;
    metadata: Metadata<T>;


    constructor(name: string, data: T,
        metadataOverrides?: { [key: string]: Partial<MetadataValue> }) {
        this.name = name;
        this.data = data;
        this.metadata = createMetadata(data, metadataOverrides);
    }

    get(path?: string[], wantsMetadata?: boolean) {

        const data = wantsMetadata ?
            this.getValueFromMetadata(path) :
            this.getValueFromData(path);

        return data;
    }

    /**
     * 
     * @param data The value to assign to the specified parameter. Can be an object
     * of multiple values
     * @param path path to the parameter(s) in the tree
     */
    put(data: ParamNode, path?: string[]) {
        console.log(data, path);

        const tmpData = this.data;
        let pointer: ParamNode = tmpData;

        path?.forEach((pathPart) => {
            if (isParamNode(pointer)) {
                if(pathPart in pointer){
                    pointer = (pointer)[pathPart] as ParamNode;
                }else {
                    console.debug("Path not in Pointer", pathPart, pointer);
                    throw new TypeError("Invalid Path");
                }
            }
        })

        // //pointer now represents the tree one node above the target parameter
        //and should have a key that matches ParamName.
        //unless no path provided (root of tree), in which case pointer is entire tree
        console.log("POINTER", pointer);

        Object.keys(data).forEach((key) => {
            const val = data[key];
            const valPath = (path ?? []).concat(key);
            this.validate(valPath, val);
            Object.assign(pointer, { [key]: val })
        })

        this.data = tmpData;

    }

    protected getValue(path?: string[], tree: ParamNode = this.data) {
        let pointer: ParamTree = tree;
        const pathCopy = path?.slice();

        if (pathCopy == undefined || pathCopy.length == 0) {
            return pointer;
        } else {
            pathCopy.forEach((pathPart) => {
                pointer = (pointer as ParamNode)[pathPart];
                if (pointer == undefined) {
                    throw new TypeError("Invalid Path");
                }
            })

            return pointer;
        }
    }

    protected getValueFromData(path?: string[]): ParamTree {
        return this.getValue(path, this.data);
    }

    protected getValueFromMetadata(path?: string[]) {
        return this.getValue(path, this.metadata) as Metadata;
    }

    protected validate<U extends ParamTree>(path: string[], val: U) {
        console.group("VALIDATE");
        console.log(path, val);
        const paramName = path.pop()!;
        console.log(this.getValueFromMetadata(path));
        let metadata = this.getValueFromMetadata(path)[paramName] as MetadataValue<U>;
        console.log(metadata);
        if (!(metadata?.writeable ?? true)) {
            throw new AdapterError(`Parameter ${paramName} is read-only`, "read_only");
        }
        // type checking
        try {
            switch (metadata?.type ?? "dict") {
                case "int":
                    if (!Number.isInteger(val)) throw false;
                    break;
                case "float":
                    if (typeof val != "number") throw false;
                    break;
                case "bool":
                    if (typeof val != "boolean") throw false;
                    break;
                case "list":
                case "range":
                case "tuple":
                    if (!Array.isArray(val)) throw false;
                    break;
                case "str":
                    if (typeof val != "string") throw false;
                    break
                case "dict":
                    if (!isParamNode(val)) throw false;
                    break;
            }
        } catch (error) {
            throw new AdapterError(
                `Type mismatch setting ${paramName}: got ${typeof val} expected ${metadata?.type ?? "dict"}`,
                "type_mismatch"
            )
        } finally {
            console.groupEnd() // VALIDATE
        }

        if (metadata?.allowed_values != undefined && !metadata.allowed_values.includes(val)) {
            throw new AdapterError(`${val} is not an allowed value for ${paramName}`, "allowed_value")
        }
        if (metadata?.min != undefined && (typeof val == "number") && val < metadata.min) {
            throw new AdapterError(`${val} is below the minimum value ${metadata.min} for ${paramName}`, "minimum")
        }
        if (metadata?.max != undefined && (typeof val == "number") && val > metadata.max) {
            throw new AdapterError(`${val} is above the maximum value ${metadata.max} for ${paramName}`, "maximum")
        }
    }

}



class OldAdapter<T extends ParamNode> extends BaseMockAdapter<T> implements HttpAdapter{

    get_response(path?: string[], wantsMetadata?: boolean): HttpResponse<JsonBodyType> {
        try {
            const paramName = path?.slice().pop();
            const data = this.get(path, wantsMetadata);
            const response_body = paramName ? {[paramName]: data} : (data as ParamNode);
            action(`Get Request ${wantsMetadata ? "With Metadata" : ""}`)(this.name, path?.join("/") ?? "");
            return HttpResponse.json(response_body);

        } catch (error) {
            action("Get Request: Invalid Path")(this.name, path?.join("/"));
            return HttpResponse.json(
                { error: `Invalid Path: ${path?.join("/")}` },
                { status: 400 }
            )
        }
    }

    put_response(data: ParamNode, path?: string[]): HttpResponse<JsonBodyType> {
        try {
            const paramName = path?.slice().pop();
            let pathCopy = path?.slice();
            
            const newData = this.put(data, pathCopy);
            const response = this.get(path);
            const response_body = paramName ? {[paramName]: response} : response as ParamNode;
            action("Put Request")(this.name, path?.join("/"), newData);
            return HttpResponse.json(response_body);

        } catch (error) {
            if (error instanceof AdapterError) {
                action("Put Request: Validation Error")(data);
                return HttpResponse.json({ "error": error.message }, { status: 400 });
            } else {
                action("Put Request: Invalid Path")(this.name, path?.join("/"));
                return HttpResponse.json({ "error": `Invalid Path: ${path?.join("/")}` }, { status: 400 });
            }
        }
    }
}

class NewAdapter<T extends ParamNode> extends BaseMockAdapter<T> implements HttpAdapter{


    get_response(path?: string[], wantsMetadata?: boolean): HttpResponse<JsonBodyType> {
        try {
            const data = this.get(path, wantsMetadata);
            const response_body = isParamNode(data) ? data : {value: data};
            action(`Get Request ${wantsMetadata ? "With Metadata" : ""}`)(this.name, path?.join("/") ?? "");
            return HttpResponse.json(response_body);


        } catch (error) {
            action("Get Request: Invalid Path")(this.name, path?.join("/"));
            return HttpResponse.json(
                { error: `Invalid Path: ${path?.join("/")}` },
                { status: 400 }
            )
        }
    }

    put_response(data: ParamNode, path?: string[]): HttpResponse<JsonBodyType> {
        console.group("PUT");
        console.debug(data, path);
        const pathCopy = path?.slice();
        let dataCopy: ParamTree;
        try {
            if("value" in data && Object.keys(data).length == 1){
                dataCopy = {[pathCopy?.pop()!]: data.value};
            } else {
                dataCopy = data;
            }
            this.put(dataCopy, pathCopy);
            const response = this.get(path);
            const response_body = isParamNode(response) ? response : {value: response};
            action("Put Request")(this.name, path?.join("/"), data);
            return HttpResponse.json(response_body);

        } catch (error) {
            if (error instanceof AdapterError) {
                action("Put Request: Validation Error")(data);
                return HttpResponse.json({ "error": error.message }, { status: 400 });
            } else {
                action("Put Request: Invalid Path")(this.name, path?.join("/"));
                return HttpResponse.json({ "error": `Invalid Path: ${path?.join("/")}` }, {status: 400});
            }
        } finally {
            console.groupEnd() // PUT
        }
    }
}


export { OldAdapter, NewAdapter, HttpAdapter };