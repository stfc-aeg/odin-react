import type { JSON } from "./types";
import { isParamNode } from "./types";


export const getValueFromPath = <T extends unknown>(data: JSON, path: string): T | undefined => {
    let splitPath = path.split("/");
    splitPath.forEach((pathPart) => {
        if(isParamNode(data)){
            data = data[pathPart];
        }
    });
    if(data != null){
        return data as T;
    }else{
        return undefined;
    }
}