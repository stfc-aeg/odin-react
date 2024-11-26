import React, { useEffect, useState } from 'react';

import Plot from 'react-plotly.js';


function OdinGraph(props) {


    const {title, prop_data, x_data=null, width=null, height=null, 
           num_x=null, num_y=null, type='scatter', series_names=[],
           colorscale="Portland", zoom_event_handler=null, layout={}} = props;
    const [data, changeData] = useState([{}]);
    const [layout_state, changeLayout] = useState(layout);


    const get_array_dimenions = (data) => {
        var x = (x_data) ? x_data.length : data.length;
        var y = (Array.isArray(data[0]) ? data[0].length : 1);
        // var z = (Array.isArray(data[0]) ? (Array.isArray(data[0][0]) ? data[0][0].length : 1) : 1);

        console.log("(" + x + ", " + y + ")");
        return {x: x, y: y};
    }

    useEffect(() => {
        console.log("Updating Data");
        var data_dims = get_array_dimenions(prop_data);
        var data = [];
        if(type == "scatter" || type == "line")
        {
            //one dimensional data set(s)
            if(data_dims.y > 1)
            {
                // multiple datasets
                for(var i = 0; i<data_dims.x; i++){
                    var dataset = {
                        x: (x_data) ? x_data : Array.from(prop_data[i], (v, k) => k),
                        y: prop_data[i],
                        type: "scatter",
                        name: series_names[i] || null
                    }
                    data.push(dataset);
                }
            }
            else
            {
                var dataset = {
                    x: (x_data) ? x_data : Array.from(prop_data, (v, k) => k),
                    y: prop_data,
                    type: "scatter"
                }
                data.push(dataset);
                
            }
            
            changeLayout(Object.assign(
                // Default values
                {
                    yaxis: {
                        autorange: true
                    },
                    title:title,
                    autosize: true,
                },

                // Apply any overrides
                layout
            ));

        }
        else if(type == "heatmap" || type == "contour")
        {
            //2d dataset

            if(data_dims.y > 1)
            {
                //data is 2 dimensional,  easy to turn into a 2d heatmap
                var dataset = {
                    z: prop_data,
                    type: type,
                    xaxis: "x",
                    yaxis: "y",
                    coloraxis: 'coloraxis',

                }
                data.push(dataset);
                
            }
            else
            {
                var reshape_data = [];
                for(var i = 0; i<prop_data.length; i+= num_x)
                {
                    reshape_data.push(prop_data.slice(i, i+num_x));
                }
                //data is one dimensional, we need to reshape it?
                var dataset = {
                    z: reshape_data,
                    type: type,
                    xaxis: "x",
                    yaxis: "y",
                    coloraxis: 'coloraxis',
                }
                data.push(dataset);
            }

            changeLayout(Object.assign(
                // Default values: pixels are 1:1 x:y, auto ranged colorscale
                {
                    zaxis: {
                        autorange: true
                    },
                    title:title,
                    autosize: true,
                    xaxis: {
                        constrain: 'domain',    // Where plot is reduced, scale axis domain to fit
                    },
                    yaxis: {
                        scaleanchor: 'x',       // Aspect ratio 1:1
                        scaleratio: 1,          // Aspect ratio 1:1
                        constrain: 'domain',    // Where plot is reduced, scale axis domain to fit
                    },
                    coloraxis: {
                        // Note: if you override coloraxis, these settings will be lost unless
                        // you duplicate them.
                        colorscale: colorscale, // This value overrides the colorscale in data
                    },
                },

                // Apply any overrides
                layout
            ));
        }

        changeData(data);

    }, [prop_data]);

    return (
        <Plot data={data} layout={layout_state} debug={true} onRelayout={zoom_event_handler} config={{responsive: true}} style={{height: '100%', width:'100%'}} useResizeHandler={true}/>
    )
}


export default OdinGraph;