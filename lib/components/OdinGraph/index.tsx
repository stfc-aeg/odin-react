import { useEffect, useState } from 'react';

import type { ColorScale, Layout, PlotData, PlotType } from 'plotly.js';
import Plot from 'react-plotly.js';
import type { PlotParams } from 'react-plotly.js';

import type { GraphData, Axis } from '../../types';
import { isGraphData } from '../../types';

interface OdinGraphProps extends Partial<Omit<PlotParams, "data">>{
    title?: string;
    data: PlotParams["data"] | Array<number> | Array<Array<number>> | GraphData[];
    type?: PlotType | "line";
    series_names?: string[];
    colorscale?: ColorScale;
    axis?: Axis[];

}

export const OdinGraph: React.FC<OdinGraphProps> = (props) => {

    const {title, data, layout={}, style={}, type="scatter", series_names, colorscale="Portland", axis=[], ...leftoverProps} = props;

    const [stateData, changeData] = useState<PlotParams["data"]>([]);
    const [stateLayout, changeLayout] = useState<Exclude<OdinGraphProps['layout'], undefined>>(layout || {});
    const [stateStyle, changeStyle] = useState<React.CSSProperties>(style || {height: '100%', width: '100%'});

    const line_default_layout: Partial<Layout> = {
        yaxis: {autorange: true, automargin: true},
        title: title ? {text: title} : undefined,
        autosize: true,
        uirevision: "true"
    };
    const heatmap_default_layout: Partial<Layout> = {
        title: title ? {text: title} : undefined,
        autosize: true,
        uirevision: "true"
    };

    useEffect(() => {
        var tmp_data: typeof stateData = [];
        var data_array: number[] | number[][];
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
            let tmp_layout = line_default_layout;
            if(axis.length){
                //axis have been defined, huzzah
                axis.forEach((axis, index) => {
                    const axisName: keyof Layout = (index ? `yaxis${index+1}` : "yaxis") as keyof Layout;
                    const axis_title = typeof axis.title == "string" ? {text: axis.title} : axis.title;
                    let layout_axis: Layout["yaxis"] = {
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