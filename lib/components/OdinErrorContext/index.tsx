import { useContext, createContext, useState, PropsWithChildren, CSSProperties, useMemo, useRef, useEffect, useReducer } from "react";

import { Alert, AlertProps, Badge } from "react-bootstrap";

import Style from './styles.module.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ErrorContext_t {
    /**
     * Add a new error to the front of the list of errors.
     * If the error has an identical message to the most recent error in the list, it will just update the count and timestamp of that error
     * @param err the error to add to the list. Will be turned into an OdinError, which contains a Timestamp and a Count parameter
     */
    setError: (err: Error) => void;
    /**
     * removes the specified OdinError from the list. Specifically, filters out any errors that have a matching Message and Timestamp
     * @param err the OdinError to remove.
     */
    clearError: (err: OdinError) => void;
    /**
     * Removes all errors from the ErrorList, resetting it to an empty array.
     */
    clearAllError: () => void;

    /** List of all errors. */
    errors: OdinError[];
}

/**
 * An Error class specifically for use within the OdinError Context
 */
class OdinError extends Error {
    /** Time at which the error most recently occurred */
    timestamp: Date;
    /** Number of repeated instances of this error that occurred */
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

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // as we are usually talking to a local Odin Control API, we
            // don't care about the network status
            networkMode: "always"  
        },
        mutations: {
            networkMode: "always"
        }
    }
});

// TypeScript only:
declare global {
    interface Window {
        __TANSTACK_QUERY_CLIENT__:
        import('@tanstack/query-core')
        .QueryClient
    }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient

const errorsReducer = (errors: OdinError[], action: ErrorAction) => {
    const err = action.error;
    switch (action.type) {
        case ErrorActionType.ADD:
            {
                if (err === undefined) {
                    console.error("Error not provided to setError method");
                    return errors;
                }
                const now = new Date();
                const newError = new OdinError(err.message, now);
                const newErrorList = errors.length ? errors.flatMap((old_err, index) => {
                    if (index == 0) {
                        if (newError.message == old_err.message) {
                            //new error has same message as the lastest in the list, so we simply want to replace it with an updated Count and Timestamp
                            newError.count += old_err.count;
                            return newError;
                        }
                        return [newError, old_err];
                    }
                    return old_err;
                }) : [newError];
                return newErrorList;
            }
        case ErrorActionType.REMOVE:
            if (err === undefined) {
                console.error("Error not provided to clearError method");
                return errors;
            }
            if ("timestamp" in err) {
                return errors.filter(old_err => old_err.message !== err.message || old_err.timestamp !== err.timestamp);
            }
            return errors.filter(old_err => old_err.message !== err.message);
        case ErrorActionType.CLEAR:
            return [];
        default:
            return errors;
    }
}

const ErrorDispatchContext = createContext<ErrorContext_t | null>(null);

/**
 * A Context Provider to allow components, such as the WithEndpoint inputs,
 * to access and add to the list of errors.
 */
const OdinErrorContext = (props: PropsWithChildren) => {

    const [errors, dispatch] = useReducer(errorsReducer, []);


    const setError = (err: Error) => dispatch({
        type: ErrorActionType.ADD,
        error: err
    });


    const clearError = (err: OdinError) => dispatch({
        type: ErrorActionType.REMOVE,
        error: err
    });


    const clearAllError = () => dispatch({
        type: ErrorActionType.CLEAR
    });

    const context = useMemo<ErrorContext_t>(() => ({ setError, clearError, clearAllError, errors }), [errors]);

    return (
        <ErrorDispatchContext value={context}>
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        </ErrorDispatchContext>
    )
}

type extendableAlertProps = Omit<AlertProps, "onClose" | "dismissible" | "variant" | "transition">;
interface ErrorAlertProps extends extendableAlertProps {
    error: OdinError;
}


/**
 * An Alert for a single OdinError.
 */
const ErrorAlert = ({ error, className, ...props }: ErrorAlertProps) => {
    const { clearError } = useError();

    const closeHandler = () => {
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

interface OdinErrorOutletProps {
    /**
     * Max height of the outlet. Will be scrollable if the list of errors
     * does not fit.
     */
    height?: CSSProperties["height"]
}

/**
 * A display that shows all errors in the list
 */
const OdinErrorOutlet = (
    { height = "calc(100vh - 15rem)" }: OdinErrorOutletProps
) => {

    const { errors } = useError();

    const secondsSinceError = errors.length > 0 ? (new Date().getTime() - errors[0].timestamp.getTime()) / 1000 : -1;
    const lastErrorMessage = (secondsSinceError > 3600) ? "over an Hour ago" :
        (secondsSinceError > 60) ? `${Math.floor(secondsSinceError / 60)} minutes, ${Math.floor(secondsSinceError % 60)} seconds ago` :
            "just now";

    return (
        errors.length > 0 && (
            <>
                <div>{`Last Error occurred ${lastErrorMessage}`}</div>
                <hr />
                <div className={Style.scrollable} style={{ maxHeight: height }}>
                    {errors.slice(0, 100).map((err, index) => (
                        <ErrorAlert error={err} key={index} />
                    ))}
                    {errors.length >= 100 &&
                        <Alert key="culled_err_warn" variant="warning" transition={false}>Additional Errors not shown</Alert>}
                </div>
            </>
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

interface SingleErrorOutletProps {
    /** Number of milliseconds the outlet is visible for before disappearing */
    delay?: number
}

/**
 * A display for the most recent Error added to the list. Will only be visible
 * when a new error occurs, and will dismiss itself after a timeout
 */
const SingleErrorOutlet = ({ delay = 5000 }: SingleErrorOutletProps) => {
    const { errors } = useError();
    const [show, setShow] = useState(true);

    const prevErrors = usePrevious(errors);

    const latestError = useMemo(() => {
        if (errors.length > prevErrors.length || errors[0]?.count > prevErrors[0]?.count) {
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
            <ErrorAlert error={latestError} className={Style.latest} show={show} />
        )
    )

}

/**
 * Custom Hook, providing access to the error list and the methods from the context.
 */
const useError = () => {
    const methods = useContext(ErrorDispatchContext);

    if (methods == null) {
        throw new Error(
            "Context not found. useError has to be used within <OdinErrorContext>"
        );
    }

    return { ...methods };
}

export { OdinErrorContext, OdinErrorOutlet, SingleErrorOutlet, useError };