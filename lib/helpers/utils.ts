import type { JSON } from "./types";
import { isParamNode } from "./types";


export const getValueFromPath = <T>(data: JSON, path: string): T | undefined => {
    const splitPath = path.split("/");
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