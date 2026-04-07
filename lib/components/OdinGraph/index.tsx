import { useEffect, useState } from 'react';

import type { ColorScale, Layout, PlotData, PlotType } from 'plotly.js';
import { Alert, Placeholder, Spinner } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import type { PlotParams } from 'react-plotly.js';

import Style from './style.module.css';

interface GraphData {
    data: number[];
    axis?: number;
}

interface Axis {
    side?: Layout["yaxis"]["side"];
    range?: [number, number];
    invert?: boolean;
    title?: Layout["yaxis"]["title"];
    visible?: boolean;
}

const isGraphData = (x: Object[]): x is GraphData[] => {
    return x[0] != undefined && "data" in x[0] && Array.isArray(x[0].data) && typeof x[0].data[0] === "number"
}

interface OdinGraphProps extends Partial<Omit<PlotParams, "data">> {
    /** Title for the Graph */
    title?: string;
    /**
     * The data to be graphed. Either a 1D or 2D array of numbers,
     * or the Plotly Data type for more complex graphing options*/
    data: PlotParams["data"] | Array<number> | Array<Array<number>> | GraphData[];
    /** Type of graph*/
    type?: PlotType | "line";
    /** Array of names for each series on a line graph*/
    series_names?: string[];
    /** Colourscale for Headmaps*/
    colorscale?: ColorScale;
    /** Custom Axis information */
    axis?: Axis[];

}

const FallbackPlotComponent = (props: Partial<PlotParams>) => {

    const style = Object.assign({ height: "450px", textAlign: "center" }, props.style);
    const [timeoutMessage, setMessage] = useState<React.ReactNode>('');
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setMessage(<Alert variant='warning'><ExclamationTriangle />
                <strong>Timeout hit. Is Plotly installed?</strong><ExclamationTriangle /></Alert>);
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div style={style}>
            <div className={Style.placeholderTitle}>
                {timeoutMessage ? timeoutMessage :
                    <>
                        <Spinner size='sm' />
                        <p>"Plotly Loading..."</p>
                    </>}</div>
            <Placeholder className={Style.placeholderContainer} as="p" animation='glow'>
                <Placeholder className={Style.placeholder} style={{ height: "85%" }} bg="primary" />
                <Placeholder className={Style.placeholder} style={{ height: "50%" }} bg="success" />
                <Placeholder className={Style.placeholder} style={{ height: "40%" }} bg="warning" />
                <Placeholder className={Style.placeholder} style={{ height: "80%" }} bg="info" />
                <Placeholder className={Style.placeholder} style={{ height: "70%" }} bg="danger" />
            </Placeholder>
        </div>

    )
}

const getPlot = async () => {
    try {
        const factory = await import('react-plotly.js');
        if (typeof factory.default === "object") {
            // for some reason, if plotly itself is not used by a project,
            // the import returns an object of {default: {default: Plot}}
            return () => ((factory.default as unknown as { default: unknown }).default)
        } else {
            return () => (factory.default);
        }
    }
    catch (error) {

        return () => (FallbackPlotComponent);

    } finally {
        console.groupEnd();
    }
}

/**
 * Graphing component designed to make data visualisation as simple or
 * complex as needed. 
 * 
 * At its most simple, a single One-Dimensional array of data can be
 * provided for a simple line graph. 2D data can be rendered either as
 * multiple series of 1D data, or as a 2D Heatmap.
 * 
 * Utilises the Plotly graphing library, and so additional data styling
 * and more complex data can be provided in the same way Plotly graphs
 * accept them.
 * 
 * Odin Data defines Plotly as an optional dependency, due to its size
 * and fact that not every GUI will require graphing capabilities, so is not
 * installed by default. A fallback component is rendered if plotly is not
 * installed.
 */
const OdinGraph = (
    { title, data, layout = {}, style = {}, type = "scatter", series_names,
        colorscale = "Portland", axis = [], ...leftoverProps }: OdinGraphProps
) => {

    const [_Plot, setPlot] = useState<React.ComponentType<PlotParams>>(() => (FallbackPlotComponent));

    const [stateData, changeData] = useState<PlotParams["data"]>([]);
    const [stateLayout, changeLayout] = useState<Exclude<OdinGraphProps['layout'], undefined>>(layout || {});
    const [stateStyle, changeStyle] = useState<React.CSSProperties>(style);

    const defaultLayout: typeof layout = {
        font: {
            color: window.getComputedStyle(document.documentElement).getPropertyValue("--bs-body-color")
        },
        plot_bgcolor: "rgba(255, 255, 255, 0)",
        paper_bgcolor: "rgba(255, 255, 255, 0)"
    }
    const line_default_layout: Partial<Layout> = {
        yaxis: { autorange: true, automargin: true },
        title: title ? { text: title } : undefined,
        autosize: true,
        uirevision: "true"
    };
    const heatmap_default_layout: Partial<Layout> = {
        title: title ? { text: title } : undefined,
        autosize: true,
        uirevision: "true"
    };

    useEffect(() => {
        // useEffect that only runs at the start (empty dependency array) to import the Plot component
        // if its available

        getPlot()
            .then((returned) => {
                setPlot(returned as () => typeof _Plot);
            })


    }, []);
    useEffect(() => {
        let tmp_data: typeof stateData = [];
        let data_array: number[] | number[][];
        if (Array.isArray(data[0])) {
            // data is an array of arrays (aka a 2d array of numbers)

            data_array = data as number[][];
            if (type == "scatter" || type == "line") {
                // each array within data is a separate dataset
                tmp_data = data_array.map<Partial<PlotData>>((value, index) =>
                ({
                    x: Array.from(value, (_, k) => k),
                    y: value,
                    type: "scatter",
                    name: series_names ? series_names[index] : undefined,

                })

                );
                changeLayout(Object.assign(
                    // Default Values
                    line_default_layout,
                    layout
                ));
            }
            else if (type == "heatmap" || type == "contour") {
                //we want a proper 2d heatmap rather than a bunch of separate 1d datasets

                tmp_data = [{
                    z: data_array,
                    type: type,
                    xaxis: "x",
                    yaxis: "y",
                    colorscale: colorscale
                }];
                changeLayout(Object.assign(
                    //default values
                    heatmap_default_layout,
                    layout
                ));
            }


        } else if (typeof data[0] === "number") {
            //data is 1d array
            data_array = data as number[];
            tmp_data = [{
                x: Array.from(data_array, (_, k) => k),
                y: data_array,
                type: "scatter"
            }];
            changeLayout(Object.assign(
                // Default Values
                line_default_layout,
                layout
            ));

        } else if (isGraphData(data)) {
            // we're doing some of our own formatting, but not the full Plotly stuff
            const tmp_layout = line_default_layout;
            if (axis.length) {
                //axis have been defined, huzzah
                axis.forEach((axis, index) => {
                    const axisName: keyof Layout = (index ? `yaxis${index + 1}` : "yaxis") as keyof Layout;
                    const axis_title = typeof axis.title == "string" ? { text: axis.title } : axis.title;
                    const layout_axis: Layout["yaxis"] = {
                        title: axis_title,
                        rangemode: "normal",
                        range: axis.range,
                        autorange: axis.invert ? "reversed" : (axis.range ? false : true),
                        automargin: true,
                        visible: axis.visible ?? true,
                        side: axis.side
                    }
                    if (index) layout_axis.overlaying = "y";
                    Object.assign(tmp_layout, { [axisName]: layout_axis });
                });
            } else {
                tmp_layout.yaxis2 = {
                    autorange: true,
                    side: "right",
                    overlaying: "y"
                }
            }
            changeLayout(Object.assign(tmp_layout, layout));
            tmp_data = data.map<Partial<PlotData>>((data, index) => (
                {
                    x: Array.from(data.data, (_, k) => k),
                    y: data.data,
                    yaxis: data.axis != null ? `y${data.axis}` : "y",
                    name: series_names ? series_names[index] : undefined,
                    type: "scatter"
                }
            ))
        } else {
            //data is Ploty.data and can probs just be passed straight to the Plot
            tmp_data = data as typeof stateData;
            changeLayout(layout);
        }
        changeData(tmp_data);

        changeStyle(Object.assign(
            { width: "100%" },
            style
        ))

    }, [data]);


    return (
        <_Plot data={stateData}
            layout={Object.assign(defaultLayout, stateLayout)}
            style={stateStyle}
            {...leftoverProps} useResizeHandler={true} />
    )
}

export { OdinGraph, FallbackPlotComponent };
export type { Axis, GraphData };
