import { useContext, createContext, useState, useMemo, PropsWithChildren } from "react";

import type { ErrorState } from "../../types";
import { Alert } from "react-bootstrap";

interface ErrorContext_t {
    error: ErrorState;
    setError: React.Dispatch<React.SetStateAction<ErrorState>>;

}

const ErrorContext = createContext<ErrorContext_t | null>(null);

export const OdinErrorContext = (props: PropsWithChildren) => {

    const [error, setError] = useState<ErrorState>(null);
    const context = useMemo<ErrorContext_t>(() => ({error, setError}), [error]);

    return (
    <ErrorContext.Provider value={context}>
        {props.children}
    </ErrorContext.Provider>
    )
}

export const OdinErrorOutlet = () => {

    const {error, setError} = useError();

    return (
        error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error.message}
            </Alert>

        )
    )
}

export const useError = () => {
    const ctx = useContext(ErrorContext);

    if(ctx ==  null){
        throw new Error(
            "Context not found. useError has to be used within <OdinErrorContext>"
        );
    }

    return ctx;
}