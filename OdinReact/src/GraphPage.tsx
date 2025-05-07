import {Container, Row, Col, Stack, Form} from 'react-bootstrap';

import { OdinGraph, TitleCard } from "../"

import type { Layout, PlotData } from 'plotly.js';
import { useEffect, useState, useMemo } from 'react';

export const GraphPage: React.FC = () => {

    const basic_data = [0, 2, 4, 5, 3, 1];
    const data_1d_multiple = [Array.from(Array(5), () => Math.round(Math.random()*10)),
        Array.from(Array(5), () => Math.round(Math.random()*10)),
        Array.from(Array(5), () => Math.round(Math.random()*10)),
        Array.from(Array(5), () => Math.round(Math.random()*10)),
        Array.from(Array(5), () => Math.round(Math.random()*10))];
    
    const [powermode, setPowermode] = useState(false);

    const [voltage, setVoltage] = useState<number[]>(Array.from(Array(10), () => Math.round(Math.random()*10)));
    const [current, setCurrent] = useState<number[]>(Array.from(Array(10), () => Math.round(Math.random()*10)));
    const [power, setPower] = useState<number[]>(Array.from(Array(10), () => Math.round(Math.random()*10)));

    const custom_layout: Partial<Layout> = {
        showlegend: false,
        autosize: true,
        title: {text: "Custom Layout Testing"},
        yaxis: {title: {text: "voltage (V)", font: {color: 'rgb(71, 124, 181)'}},
                tickfont: {color: 'rgb(71, 124, 181)'},
                rangemode: 'tozero',
                range: [0, 100],
                visible: (!powermode)
        },
        yaxis2: {title: {text: "current (A)", font: {color: 'rgb(245, 144, 44)'}}, 
                tickfont: {color: 'rgb(245, 144, 44)'},
                rangemode: 'tozero',
                range: [0, 110], 
                overlaying:'y', side:'right',
                visible: (!powermode)
        },
        yaxis3: {title: {text: "power (W)"},
                rangemode: 'tozero',
                visible: (powermode ? true : false),
                range: [0, 100]
        },
        xaxis: {title:"time", 
            showticklabels: true,
            tickmode: "linear",
            dtick: 30000
        },
        uirevision: "true"
    }

    const voltage_dataset = useMemo<Partial<PlotData>>(() => {return {
        x: Array.from(Array(10), (v, k) => new Date(Date.now() + (k*60000)).toISOString()),
        y: voltage,
        name: "voltage",
        visible: (!powermode)
    }},[voltage, powermode] )

    const current_dataset = useMemo<Partial<PlotData>>(() => {return {
        x: Array.from(Array(10), (v, k) => new Date(Date.now() + (k*60000)).toISOString()),
        y: current,
        yaxis: "y2",
        name: "current",
        visible: (!powermode)
    }}, [current, powermode]);

    const power_dataset = useMemo<Partial<PlotData>>(() => {return {
        x: Array.from(Array(10), (v, k) => new Date(Date.now() + (k*60000)).toISOString()),
        y: power,
        yaxis: "y3",
        name: "power",
        visible: powermode
    }}, [power, powermode]);

    var data = powermode ? [voltage_dataset, current_dataset, power_dataset] : [voltage_dataset, current_dataset];

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Setting Values for custom chart");
            setVoltage(Array.from(Array(10), () => Math.round(Math.random()*10)));
            setCurrent(Array.from(Array(10), () => Math.round(Math.random()*10)));
            setPower(Array.from(Array(10), () => Math.round(Math.random()*10)));
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    return (
        <Container>
            <Row>
                <Col>
                    <TitleCard title="Basic Graph">
                        <OdinGraph data={basic_data} title={"Test"}/>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Multiple Datasets">
                    <OdinGraph data={data_1d_multiple}/>
                    </TitleCard>
                </Col>
                <Col>
                    <TitleCard title="Heatmap">
                    <OdinGraph data={data_1d_multiple} type='heatmap'/>
                    </TitleCard>
                </Col>
            </Row>
            <Row>
                <Col>
                    <TitleCard title="Custom Layout and Data">
                    <Stack>
                    <Form>
                        <Form.Check type='switch' label="Power Mode" 
                                    onChange={() => setPowermode(!powermode)}
                                    checked={powermode}/>
                    </Form>
                    <OdinGraph data={data} layout={custom_layout} />
                    </Stack>
                    </TitleCard>
                </Col>
            </Row>
        </Container>
    )

}