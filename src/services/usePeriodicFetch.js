import { useState, useEffect } from "react";

function usePeriodicFetch(url, adapter)
{
    const [response, setResponse] = useState(null);
    

    useEffect(() => 
    {
        const interval = setInterval(() =>
        {
            adapter.get(url)
            .then(result => {
                setResponse(result);
            })
            .catch(error => {
                console.log(error.message);
                // throw(error);
            })
        }, 1000);
        
        return () => clearInterval(interval);
    }, [url]);

    return {response};
}

export default usePeriodicFetch;