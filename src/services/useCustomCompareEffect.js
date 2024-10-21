import {useRef, useEffect} from 'react';


function useCustomCompareMemo(value, equal)
{
    const ref = useRef(value);
    if(!equal(value, ref.current))
    {
        ref.current = value;
    }

    return ref.current;
}

function useCustomCompareEffect(create, input, equal)
{
    useEffect(create, [useCustomCompareMemo(input, equal)]);
}

export default useCustomCompareEffect;