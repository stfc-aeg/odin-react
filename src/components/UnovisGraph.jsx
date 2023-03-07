import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "./TitleCard";
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisBulletLegend, VisTooltip, VisScatter } from '@unovis/react'
import { Scale, colors, Line, Scatter } from '@unovis/ts'
import { useCallback } from "react";
import _ from 'lodash';

function GraphCard(props) {

    const {title, data, isTimestamps=false, curveType=null, showLabels=false} = props;

    const [graphData, changeGraphData] = useState(null);
    const [lowestX, changeMinX] = useState(0);
    const [biggestX, changeMaxX] = useState(null);


    useEffect(() => {
        var graphDataTemp = [];
        var allXes = [];
        // changeMinX(...data.map(element => [...element.x]));
        data.map(element => allXes.push(...element.x));

        changeMinX(Math.min(...allXes));
        changeMaxX(Math.max(...allXes));
        // console.log(Math.min(...lowestX));
        // changeMaxX(Math.max(...element.x));
        data.forEach((element, i) => {

            element.x.forEach((xValue, j) => {
                var xlabel = "x" + i;
                var ylabel = "y" + i;

                graphDataTemp.push({[xlabel]: xValue, [ylabel]: element.y[j], index: i})
            });
        });

        changeGraphData(graphDataTemp);
    }, [data]);


    const options = {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      };

    const xScale = useMemo(() => Scale.scaleTime(), []);
    // const labels = useCallback((d) => d[y0], []);

    const createLines = data.map((data, i) =>
      <VisLine curveType="linear" duration={0} color={colors[i]} key={i}
        x={useCallback(d => d["x" + i]*(isTimestamps ? 1000: 1), [])}
        y={useCallback(d => d["y" + i], [])}>
      </VisLine>
    );

    const createLegend = data.map((data, i) => (
        {name: data.label ? data.label : "Dataset " + (i+1)}
    ));

    return (
        
        <TitleCard title={title}>
            <VisBulletLegend items={createLegend}/>
            <VisXYContainer data={graphData} xScale={xScale}>
                {createLines}
                <VisScatter duration={0} labelPosition="top"
                color={useCallback(d => colors[d.index], [])}
                label={showLabels ? useCallback(d => d['y' + d.index], []) : null}
                x={useCallback(d => d["x" + d.index]*(isTimestamps ? 1000: 1), [])}
                y={useCallback(d => d["y" + d.index], [])}>
                </VisScatter>
                <VisAxis type="x" tickFormat={Intl.DateTimeFormat('default', options).format} duration={0}></VisAxis>
                <VisAxis type="y"></VisAxis>
            </VisXYContainer>
        </TitleCard>
    )
}

export default GraphCard;