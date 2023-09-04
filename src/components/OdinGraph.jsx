import React, { useEffect, useState } from 'react';

import Plot from 'react-plotly.js';


function OdinGraph(props) {


    const {title, prop_data, width=null, height=null, 
           num_x=null, num_y=null, type='scatter', series_names=[]} = props;
    const [data, changeData] = useState([{}]);
    const [layout, changeLayout] = useState({});


    const get_array_dimenions = (data) => {
        var x = data.length;
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
                        x: Array.from(prop_data[i], (v, k) => k),
                        y: Array.from(prop_data[i], (v, k) => v),
                        type: "scatter",
                        name: series_names[i] || null
                    }
                    data.push(dataset);
                }
            }
            else
            {
                var dataset = {
                    x: Array.from(prop_data, (v, k) => k),
                    y: Array.from(prop_data, (v, k) => v),
                    type: "scatter"
                }
                data.push(dataset);
                
            }
            
            changeLayout({yaxis: {autorange: true}, width:width || 1, height:height || 1, title:title});

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
                    yaxis: "y"

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
                    yaxis: "y"
                }
                data.push(dataset);
            }
            changeLayout({zaxis: {autorange: true}, width:1, height:1, title:title});
        }

        changeData(data);

    }, [prop_data]);

    return (
        <Plot data={data} layout={layout} debug={true}/>
    )
}


export default OdinGraph;