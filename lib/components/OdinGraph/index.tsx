import { useEffect, useState, lazy, PureComponent } from 'react';

import type { ColorScale, Layout, PlotData, PlotType } from 'plotly.js';
import type { PlotParams } from 'react-plotly.js'; 

import type { GraphData, Axis } from '../../helpers/types';
import { isGraphData } from '../../helpers/types';

interface OdinGraphProps extends Partial<Omit<PlotParams, "data">>{
    title?: string;
    data: PlotParams["data"] | Array<number> | Array<Array<number>> | GraphData[];
    type?: PlotType | "line";
    series_names?: string[];
    colorscale?: ColorScale;
    axis?: Axis[];

}

class FallbackPlotComponent extends PureComponent<PlotParams> {
    render() {
        return (<p>Plotly Not Installed. Do not try and use OdinGraph without first installing <code>plotly.js</code> and <code>react-plotly.js</code></p>)
    }
}

const Plot = lazy(() => import('react-plotly.js')
    .then((plotlyModule) => (
        {default: plotlyModule.default}
    ))
    .catch(
    (error) => {
        console.error("Plotly Plot unable to be imported: ", error);
        return {default: FallbackPlotComponent};
    })
)

export const OdinGraph: React.FC<OdinGraphProps> = (props) => {

    const {title, data, layout={}, style={}, type="scatter", series_names, colorscale="Portland", axis=[], ...leftoverProps} = props;

    const [stateData, changeData] = useState<PlotParams["data"]>([]);
    const [stateLayout, changeLayout] = useState<Exclude<OdinGraphProps['layout'], undefined>>(layout || {});
    const [stateStyle, changeStyle] = useState<React.CSSProperties>(style || {height: '100%', width: '100%'});

    const darkMode: boolean = document.querySelector("html")?.getAttribute("data-bs-theme") == "dark";
    const defaultFont: PlotParams["layout"]["font"] = {color: darkMode ? "rgb(255, 255, 255)" : undefined};
    const defaultBackground: PlotParams["layout"]["paper_bgcolor"] = "rgba(255, 255, 255, 0)";
    console.log(Plot);
    const line_default_layout: Partial<Layout> = {
        font: defaultFont,
        yaxis: {autorange: true, automargin: true},
        title: title ? {text: title} : undefined,
        autosize: true,
        uirevision: "true",
        paper_bgcolor: defaultBackground
    };
    const heatmap_default_layout: Partial<Layout> = {
        font: defaultFont,
        title: title ? {text: title} : undefined,
        autosize: true,
        uirevision: "true",
        paper_bgcolor: defaultBackground
    };

    useEffect(() => {
        let tmp_data: typeof stateData = [];
        let data_array: number[] | number[][];
        if(Array.isArray(data[0])){
            // data is an array of arrays (aka a 2d array of numbers)

            data_array = data as number[][];
            if(type == "scatter" || type == "line"){
                // each array within data is a separate dataset
                tmp_data = data_array.map<Partial<PlotData>>((value, index) => 
                    ({
                        x: Array.from(value, (_, k) => k),
                        y: value,
                        type: "scatter",
                        name: series_names ? series_names[index] : undefined,

                    } )

                );
                changeLayout(Object.assign(
                    // Default Values
                    line_default_layout,
                    layout
                ));
            }
            else if(type == "heatmap" || type == "contour")
            {
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


        }else if(typeof data[0] === "number"){
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

        }else if(isGraphData(data)){
            // we're doing some of our own formatting, but not the full Plotly stuff
            const tmp_layout = line_default_layout;
            if(axis.length){
                //axis have been defined, huzzah
                axis.forEach((axis, index) => {
                    const axisName: keyof Layout = (index ? `yaxis${index+1}` : "yaxis") as keyof Layout;
                    const axis_title = typeof axis.title == "string" ? {text: axis.title} : axis.title;
                    const layout_axis: Layout["yaxis"] = {
                        title: axis_title,
                        rangemode: "normal",
                        range: axis.range,
                        autorange: axis.invert ? "reversed" : (axis.range ? false : true),
                        automargin: true,
                        visible: axis.visible ?? true,
                        side: axis.side
                    }
                    if(index) layout_axis.overlaying = "y";
                    Object.assign(tmp_layout, {[axisName]: layout_axis});
                });
            }else{
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
        }else{
            //data is Ploty.data and can probs just be passed straight to the Plot
            tmp_data = data as typeof stateData;
            changeLayout(layout);
        }
        changeData(tmp_data);

        changeStyle(Object.assign(
            {height: '100%', width: "99%"},
            style
        ))

    }, [data]);


    return (
        <Plot data={stateData} layout={stateLayout} style={stateStyle}
        {...leftoverProps} useResizeHandler={true}/>
    )
}