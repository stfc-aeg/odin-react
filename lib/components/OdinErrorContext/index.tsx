import { useContext, createContext, useState, useMemo, PropsWithChildren } from "react";

import { Alert } from "react-bootstrap";

interface ErrorContext_t {
    error: Error | null;
    setError: React.Dispatch<React.SetStateAction<Error | null>>;

}

const ErrorContext = createContext<ErrorContext_t | null>(null);

const OdinErrorContext = (props: PropsWithChildren) => {

    const [error, setError] = useState<Error | null>(null);
    const context = useMemo<ErrorContext_t>(() => ({error, setError}), [error]);

    return (
    <ErrorContext.Provider value={context}>
        {props.children}
    </ErrorContext.Provider>
    )
}

const OdinErrorOutlet = () => {

    const {error, setError} = useError();

    return (
        error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error.message}
            </Alert>

        )
    )
}

const useError = () => {
    const ctx = useContext(ErrorContext);

    if(ctx ==  null){
        throw new Error(
            "Context not found. useError has to be used within <OdinErrorContext>"
        );
    }

    return ctx;
}

export { OdinErrorContext, OdinErrorOutlet, useError};