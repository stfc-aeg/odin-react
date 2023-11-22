import React from 'react';


import { Container, Stack } from 'react-bootstrap';
import { OdinGraph, TitleCard } from 'odin-react';


function GraphExamplePage(props) {

    const data_1d = [0, 2, 4, 5, 3, 1];
    const x_data =  [4, 5, 6, 7, 7, 9];
    const data_1d_multiple = [Array.from(Array(5), () => Math.round(Math.random()*10)),
                              Array.from(Array(5), () => Math.round(Math.random()*10)),
                              Array.from(Array(5), () => Math.round(Math.random()*10)),
                              Array.from(Array(5), () => Math.round(Math.random()*10)),
                              Array.from(Array(5), () => Math.round(Math.random()*10))];
    const data_2d_reshape = Array.from(Array(16*16), () => Math.random());
    return (
        <Container>
            <Stack>
            <OdinGraph title="Single Dataset" prop_data={data_1d} x_data={x_data}/>
            <OdinGraph title="Multiple Datasets" prop_data={data_1d_multiple}
                       series_names={["Test 1", "Test 2", "Test Again", "Low", "High"]}/>
            <OdinGraph title="Heatmap" prop_data={data_1d_multiple} type="heatmap" />
            <OdinGraph type="heatmap" prop_data={data_2d_reshape} num_x={16} title="Reshaped Heatmap" />
            </Stack>

            

        </Container>
    )
}

export default GraphExamplePage;