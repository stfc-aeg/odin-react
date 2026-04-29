import { ComponentProps, CSSProperties, useState, useEffect, useRef } from 'react';
import type { InputGroupProps, FormControlProps } from 'react-bootstrap';
import { Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { getValueFromPath } from '../AdapterEndpoint';
import type { MetadataValue } from '../AdapterEndpoint/AdapterEndpoint.types';
import { useRequestHandler, type EndpointProps } from './util';


interface RangedAdditionalProps {
    /** 
     * Record of keys to display in the dropdown, and the corresponding
     * value to multiply by if that option is selected.
     * 
     * 
     * For example, for a Voltage param expecting V: {"V": 1, "kV": 1000, "mV": 1/1000}
     */
    ranges: Record<string, number>;
    /** Minimum value of the input */
    min?: number;
    /** Maximum value of the input */
    max?: number;
    /** Specifies the granularity of the value */
    step?: number;
}

type MultipliedInputProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
    EndpointProps<PreArgs, PostArgs> & Omit<InputGroupProps, keyof EndpointProps<PreArgs, PostArgs>> &
    RangedAdditionalProps;


/**
 * An Endpoint Input with an included multiplier/range dropdown, for Parameters
 * that may have multiple scaling ranges such as Voltage, Amps, Seconds, etc.
 * 
 * Whilst the displayed value scales based on the selected range, the underlying
 * value sent to the Adapter does not get altered. This is designed purely so that
 * the user can more easily view and enter values that might have wide range
 * options.
 */
const EndpointMultipliedInput = <PreArgs extends unknown[], PostArgs extends unknown[]>(
    { endpoint, fullpath, value, disabled, min, max,
        pre_method, pre_args,
        post_method, post_args,
        ranges, title, step = 1,
        ...rest }: MultipliedInputProps<PreArgs, PostArgs>
) => {

    const { requestHandler, data: endVal, disable } = useRequestHandler({
        endpoint, fullpath, disabled, pre_method, pre_args, post_method, post_args
    });

    const [multiply, changeMultiply] = useState<string>(
        Object.keys(ranges).find(key => ranges[key] === 1) ?? Object.keys(ranges)[0]);
    const [compVal, changeCompVal] = useState<number>(0);
    const [editing, setEditing] = useState(false);

    const component = useRef<HTMLInputElement>(null);

    const metaData: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);
    const compMin = min ?? metaData?.min;
    const compMax = max ?? metaData?.max;

    const label = title || metaData?.name || fullpath.split("/").at(-1);

    const style: CSSProperties = editing ? { backgroundColor: "var(--bs-highlight-bg)" } : {};

    const onChangeHandler: FormControlProps["onChange"] = (event) => {
        const val = (event.target as HTMLInputElement).valueAsNumber * ranges[multiply];

        changeCompVal(val);

        setEditing(!(val == endVal));
    }

    const onEnterHandler: FormControlProps["onKeyUp"] = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            console.debug(fullpath, event);
            requestHandler(compVal);
            setEditing(false);
        }
    }

    const onSelectHandler: ComponentProps<typeof DropdownButton>["onSelect"] = (eventKey) => {

        changeMultiply(eventKey!);
    };

    useEffect(() => {
        //Endpoint Value changed, update component value if need be.
        const newVal = getValueFromPath<number>(endpoint.data, fullpath);

        // check if the component is not currently active
        if (document.activeElement !== component.current && !editing && typeof newVal !== "undefined") {
            changeCompVal(newVal);
        }

    }, [endpoint.updateFlag, endVal]);

    return (
        <InputGroup {...rest}>
            <InputGroup.Text>{label ?? "Value"}</InputGroup.Text>
            <Form.Control ref={component} type='number' style={style}
                onChange={onChangeHandler} onKeyUp={onEnterHandler}
                value={compVal / ranges[multiply]} disabled={disable}
                min={compMin ? compMin / ranges[multiply] : undefined}
                max={compMax ? compMax / ranges[multiply] : undefined}
                step={step ? step / ranges[multiply] : undefined} />
            <DropdownButton title={multiply} onSelect={onSelectHandler} disabled={disable}>
                {Object.entries(ranges).sort((a, b) => a[1] - b[1]).map(
                    (selection) => (
                        <Dropdown.Item key={selection[1]} eventKey={selection[0]} active={selection[0] == multiply}>
                            {selection[0]}
                        </Dropdown.Item>
                    )
                )}
            </DropdownButton>
        </InputGroup>
    )


}

export { EndpointMultipliedInput };
