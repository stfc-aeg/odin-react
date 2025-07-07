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

export const compareObjects = (obj1: object, obj2: object): boolean => {
    //if constructors are different, object type is different (comparing Date with Array or something)
    if(obj1.constructor !== obj2.constructor) return false;
    
    const objKeys1 = Object.keys(obj1).sort();
    const objKeys2 = Object.keys(obj2).sort();
    
    //different number of keys, different objects
    if(objKeys1.length != objKeys2.length) return false;

    for(const [key1, val1] of Object.entries(obj1)) {
        if(key1 in obj2){
            const val2: unknown = obj2[key1 as keyof typeof obj2];
            if(typeof val1 == typeof val2){
                switch(typeof val1){
                    case "object": 
                        return compareObjects(val1, val2 as typeof val1);
                    case "symbol":
                        return val1.toString() == (val2 as typeof val1).toString();

                    default: return val1 === val2 as typeof val1;
                }
            }else return false;
        }else return false;
    }





    return true;
}