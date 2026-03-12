import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import { getValueFromPath } from "../AdapterEndpoint";
import type { MetadataValue } from "../AdapterEndpoint/AdapterEndpoint.types";
import { EndpointButton } from "./EndpointButton";
import { EndpointCheckbox } from "./EndpointCheckbox";
import { EndpointDoubleSlider } from "./EndpointDoubleSlider";
import { EndpointDropdown } from "./EndpointDropdown";
import { EndpointInput } from "./EndpointInput";
import { EndpointSlider } from "./EndpointSlider";
import type { EndpointProps } from "./util";
import { useRequestHandler } from "./util";
// import { isEqual } from 'lodash';



type selectEvent_t = {
    onSelect?: (eventKey: number | string, event: React.SyntheticEvent) => void,
    onClick?: (event: React.MouseEvent) => void,
    onKeyPress?: (event: React.KeyboardEvent) => void,
    onChange?: (event: React.ChangeEvent) => void

};

/**
 * A Generic Higher Order Compoennt that provides parameter read/write to the provided component
 * This allows near any component that has some user interactivity (buttons, text boxes, etc)
 * to automatically and directly control a parameter on an Adapter.
 * 
 * For the most part, the specific components already created should be used,
 * as they cover the most commonly used options:
 * {@link EndpointButton}
 * {@link EndpointInput}
 * {@link EndpointDropdown}
 * {@link EndpointCheckbox}
 * 
 * @example
 * //Created a Button that connects to a parameter
 * const CustomEndpointButton = WithEndpoint(Button)
 * @param WrappedComponent the component to add Endpoint access to
 * @returns a new component with additional props, that automatically provides read/write access
 * to a defined Parameter on the Adapter's Tree.
 */
const WithEndpoint = <P extends object>(WrappedComponent: React.FC<P>) => {
    /**
     * Combined Props for resulting WithEndpoint Component.
     * Combines {@link EndpointProps} with the props of whatever component is being wrapped.*/
    type WrappedComponentProps<PreArgs extends unknown[], PostArgs extends unknown[]> =
        EndpointProps<PreArgs, PostArgs> & P;


    const WithEndpointComponent = <PreArgs extends unknown[], PostArgs extends unknown[]>(
        props: WrappedComponentProps<PreArgs, PostArgs>) => {

        const { endpoint, fullpath, value, disabled,
            pre_method, pre_args, post_method, post_args,
            ...leftoverProps } = props;

        const component = useRef<Element>(null);

        const { requestHandler, data: endpointValue, disable } = useRequestHandler({
            endpoint, fullpath, value, disabled,
            pre_method, pre_args,
            post_method, post_args
        })

        const metadata: MetadataValue | undefined = getValueFromPath(endpoint.metadata, fullpath);


        const [eventProp, setEventProp] = useState<selectEvent_t>({ onChange: (event) => onChangeHandler(event) });
        const [componentValue, setComponentValue] = useState<typeof value>(value ?? undefined);
        // const [metadata, setMetadata] = useState<metadata_t | null>(null);

        const [editing, setEditing] = useState(false);

        const changedStyle: CSSProperties = {
            backgroundColor: "var(--bs-highlight-bg)"
        }
        const style: CSSProperties = editing ? changedStyle : {};

        const componentPassedValue = useMemo(() => {
            const curComponent = component.current;
            const val = componentValue ?? "";
            if (curComponent) {
                // coded using switch case to future proof if there's other special case component types
                switch (curComponent.nodeName) {
                    case "INPUT":
                        {
                            const input_type = (curComponent as HTMLInputElement).type;
                            switch (input_type) {
                                case "checkbox":
                                case "radio":
                                    return { checked: Boolean(val) };
                                default:
                                    return { value: val };
                            }
                        }
                    default:
                        return { value: val };
                }
            }
            return { value: "", checked: false };
        }, [component.current, componentValue]);

        useEffect(() => {
            // update flag got changed, check if we need to change anything
            if (value == null) {  // if value is defined, we dont wanna overwrite anything
                const newVal = getValueFromPath<typeof value>(endpoint.data, fullpath);
                // check if component value has been modified, or if the input is active. If so,
                // dont mess with the value. Otherwise, set the component val
                if (document.activeElement !== component.current && !editing && typeof newVal !== "undefined") {
                    setComponentValue(newVal);
                }
            }
        }, [endpoint.updateFlag, endpointValue]);

        const handleRequest = (val: typeof value) => {

            requestHandler(val);
            setEditing(false);
        };

        const onSelectHandler = (event: React.SyntheticEvent, eventKey: number | string) => {
            console.debug(fullpath, "On Select Handler");
            console.debug(fullpath, "event: ", event);
            console.debug(fullpath, "EventKey: ", eventKey);

            handleRequest(eventKey);
        }

        const onClickHandler = (event: React.MouseEvent) => {
            console.debug(fullpath, event);
            const curComponent = component.current!;
            let val: typeof value;
            if (value != null) {
                val = value;
            } else {
                const compType = component.current!.nodeName;
                // if the type of component is a checkbox or a radio button, get the value from the "checked" prop
                if (compType === "INPUT" && ["checkbox", "radio"].includes((component.current! as HTMLInputElement).type)) {
                    val = (component.current! as HTMLInputElement).checked;
                } else {
                    val = "value" in curComponent ? curComponent.value as typeof value : value;
                }
            }
            handleRequest(val);
        };

        const onChangeHandler = (event: React.ChangeEvent) => {
            //this onChange handler sets the ComponentValue State, to manage the component and monitor its value
            const target = event.target;
            let val: typeof value = "";

            if ("value" in target && target.value != null) {
                val = target.value as typeof value;
            } else
                if ("value" in component.current!) {
                    val = component.current.value as typeof value;
                }
            setComponentValue(val);
            setEditing(!(val == endpointValue));

            // special case. If the underlying component is a html <select> tag, send the request
            // without needing the onEnterHandler
            const compType = component.current?.nodeName;
            if (compType === "SELECT") {
                handleRequest(val);
            }
        };

        const onEnterHandler = (event: React.KeyboardEvent) => {
            if (event.key === "Enter" && !event.shiftKey) {
                handleRequest(componentValue);
            }
        };

        useEffect(() => {
            let events: selectEvent_t = { onKeyPress: (event) => onEnterHandler(event), onChange: (event) => onChangeHandler(event) };
            const curComponent = component.current;
            if (curComponent) {
                switch (curComponent.nodeName) {
                    case "BUTTON":
                        //default buttons to using the onClick event handler
                        events = { onClick: (event) => onClickHandler(event) };
                        break;

                    case "INPUT":
                        {
                            const input_type = (curComponent as HTMLInputElement).type;
                            switch (input_type) {
                                case "checkbox":
                                case "radio":
                                    //default checkboxes and radios to using the onClick event handler
                                    events = { onClick: (event) => onClickHandler(event) };
                                    break;
                                case "text":
                                case "number":
                                default:
                                    break;
                            }
                            break;
                        }
                    case "DIV":
                        {
                            const divClass = (curComponent as HTMLDivElement).className;
                            if (divClass === "dropdown") {
                                //bootstrap dropdowns are contained in a div with a classname of "dropdown"
                                events = { onSelect: (eventKey, event) => onSelectHandler(event, eventKey) };
                            }
                            break;
                        }
                    case "SELECT":
                        // the onSelect event handler is a specially created one for bootstrap dropdowns
                        // standard html dropdowns (<select> tags) use the onChange event handler by default
                        events = { onChange: (event) => onChangeHandler(event) };
                        break;
                }
            }
            setEventProp(events);
        }, [value, componentValue, component.current]);

        return (<WrappedComponent
            {...Object.assign(leftoverProps, { min: metadata?.min, max: metadata?.max }) as P}
            style={style}
            {...eventProp}
            min={metadata?.min}
            max={metadata?.max}
            {...componentPassedValue}
            disabled={disable}
            ref={component}
        />)

    }

    return (
        WithEndpointComponent
    )
};



export {
    EndpointButton,
    EndpointCheckbox,
    EndpointDoubleSlider,
    EndpointDropdown,
    EndpointInput,
    EndpointSlider
};

export { WithEndpoint };

