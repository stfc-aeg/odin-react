import { useState, useEffect } from "react";

function UseApiPut(url, adapter, value)
{
    const [response, setResponse] = useState(null);

    useEffect(() =>
    {
        console.log("Use API PUT effect");
        adapter.put(value, url)
        .then(result => {
            setResponse(result);
        })
        .catch(error => {
            console.log(error.message);
        })
    }, [value]);

    return {response};
}

export default UseApiPut;