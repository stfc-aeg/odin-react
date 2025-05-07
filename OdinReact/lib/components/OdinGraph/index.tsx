import { useEffect, useState } from 'react';

import type { ColorScale, Layout, PlotData, PlotType } from 'plotly.js';
import Plot from 'react-plotly.js';
import type { PlotParams } from 'react-plotly.js';

interface OdinGraphProps extends Partial<Omit<PlotParams, "data">>{
    title?: string;
    data: Partial<PlotData>[] | Array<number> | Array<Array<number>>;
    type?: PlotType | "line";
    series_names?: string[];
    colorscale?: ColorScale;

}



export const OdinGraph: React.FC<OdinGraphProps> = (props: OdinGraphProps) => {

    const {title, data, layout={}, style={}, type="scatter", series_names, colorscale="Portland", ...leftoverProps} = props;

    const [stateData, changeData] = useState<Exclude<OdinGraphProps["data"], number[] | number[][]>>([]);
    const [stateLayout, changeLayout] = useState<Exclude<OdinGraphProps['layout'], undefined>>(layout || {});
    const [stateStyle, changeStyle] = useState<React.CSSProperties>(style || {height: '100%', width: '100%'});

    const line_default_layout: Partial<Layout> = {
        yaxis: {autorange: true},
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
                        colorscale: colorscale

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