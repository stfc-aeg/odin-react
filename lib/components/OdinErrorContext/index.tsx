import { useContext, createContext, useState, PropsWithChildren, CSSProperties, useMemo, useRef, useEffect, useReducer } from "react";

import { Alert, AlertProps, Badge } from "react-bootstrap";

import Style from './styles.module.css';

interface ErrorContext_t {
    setError: (err: Error) => void;
    clearError: (err: OdinError) => void;
    clearAllError: () => void;
}

/**
 * An Error class specifically for use within the OdinError Context
 */
class OdinError extends Error {
    timestamp: Date;
    count: number;

    constructor(message: string, timestamp: Date) {
        super(message);
        this.name = "OdinError";
        this.timestamp = timestamp;
        this.count = 1;
    }
}

enum ErrorActionType {
    ADD = "ADD",
    REMOVE = "REMOVE",
    CLEAR = "CLEAR"

}

interface ErrorAction {
    type: ErrorActionType;
    error?: Error | OdinError;
}

const errorsReducer = (errors: OdinError[], action: ErrorAction) => {
    const err = action.error;
    switch(action.type){
        case ErrorActionType.ADD:
            if(err === undefined){
                console.error("Error not provided to setError method");
                return errors;
            }
            const now = new Date();
            const newError = new OdinError(err.message, now);
            const newErrorList = errors.length ? errors.flatMap((old_err, index) => {
                if(index == 0){
                    if(newError.message == old_err.message){
                        //new error has same message as the lastest in the list, so we simply want to replace it with an updated Count and Timestamp
                        newError.count += old_err.count;
                        return newError;
                    }
                    return [newError, old_err];
                }
                return old_err;
            }) : [newError];
            return newErrorList;
        case ErrorActionType.REMOVE:
            if(err === undefined){
                console.error("Error not provided to clearError method");
                return errors;
            }
            if("timestamp" in err){
                return errors.filter(old_err => old_err.message !== err.message || old_err.timestamp !== err.timestamp);
            }
            return errors.filter(old_err => old_err.message !== err.message);
        case ErrorActionType.CLEAR:
            return [];
        default:
            return errors;
    }
}


const ErrorContext = createContext<OdinError[]>([]);
const ErrorDispatchContext = createContext<ErrorContext_t | null>(null);

const OdinErrorContext = (props: PropsWithChildren) => {

    const [errors, dispatch] = useReducer(errorsReducer, []);

    /**
     * Add a new error to the front of the list of errors.
     * If the error has an idential message to the most recent error in the list, it will just update the count and timestamp of that error
     * @param err the error to add to the list. Will be turned into an OdinError, which contains a Timestamp and a Count parameter
     */
    const setError = (err: Error) => dispatch({
        type: ErrorActionType.ADD,
        error: err
    });

    /**
     * removes the specified OdinError from the list. Specifically, filters out any errors that have a matching Message and Timestamp
     * @param err the OdinError to remove.
     */
    const clearError = (err: OdinError) => dispatch({
        type: ErrorActionType.REMOVE,
        error: err
    });

    /**
     * Removes all errors from the ErrorList, resetting it to an empty array.
     */
    const clearAllError = () => dispatch({
        type: ErrorActionType.CLEAR
    });

    const context = useMemo<ErrorContext_t>(() => ({setError, clearError, clearAllError}), [errors]);

    return (
    <ErrorContext value={errors}>
        <ErrorDispatchContext value={context}>
            {props.children}
        </ErrorDispatchContext>
    </ErrorContext>
    )
}

type extendableAlertProps = Omit<AlertProps, "onClose" | "dismissible" | "variant" | "transition">;
interface ErrorAlertProps extends extendableAlertProps {
    error: OdinError;
}



const ErrorAlert: React.FC<ErrorAlertProps> = ({error, className, ...props}) => {
    const {clearError} = useError();

    const closeHandler = () => {
        console.log("Closing Error:", error);
        clearError(error);
    }
    return (
        <Alert variant="danger" onClose={closeHandler}
        dismissible className={`${Style.errorAlert} ${className}`} transition={false} {...props}>
        <small>
            <Badge bg="danger" className={Style.errorBadge}>{error.count}</Badge>
            {error.timestamp.toLocaleTimeString()}
        </small>
        <div className={Style.errorMessage}>{error.message}</div>
        </Alert>
    )
}


const OdinErrorOutlet: React.FC<{height?: CSSProperties["height"]}> = ({height = "calc(100vh - 10rem)"}) => {

    const {errors} = useError();


    return (
        errors.length > 0 && (
            <div className={Style.scrollable} style={{maxHeight: height}}>
            {errors.slice(0, 100).map((err, index) => (
                <ErrorAlert error={err} key={index}/>
            ))}
            {errors.length >=100 &&
            <Alert key="culled_err_warn" variant="warning" transition={false}>Additional Errors not shown</Alert>}
            </div>
        )
    )
}

function usePrevious<T>(value: T): T {
    const ref = useRef<T>(value);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const SingleErrorOutlet: React.FC<{delay?: number}> = ({delay=5000}) => {
    const {errors} = useError();
    const [show, setShow] = useState(true);

    const prevErrors = usePrevious(errors);

    const latestError = useMemo(() => {
        if(errors.length > prevErrors.length || errors[0]?.count > prevErrors[0]?.count){
            return errors[0];
        }
        return null
    }, [errors])

    useEffect(() => {
        setShow(latestError != null);
        const timer_id = setTimeout(() => setShow(false), delay);

        return () => clearTimeout(timer_id);
    }, [latestError]);

    return (
        latestError && (
            <ErrorAlert error={latestError} className={Style.latest} show={show}/>
        )
    )

}

const useError = () => {
    const errors = useContext(ErrorContext);
    const methods = useContext(ErrorDispatchContext);

    if(methods ==  null){
        throw new Error(
            "Context not found. useError has to be used within <OdinErrorContext>"
        );
    }

    return {errors, ...methods};
}

export { OdinErrorContext, OdinErrorOutlet, SingleErrorOutlet, useError};