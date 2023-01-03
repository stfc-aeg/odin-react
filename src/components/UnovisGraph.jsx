import React, { useEffect, useState, useMemo } from "react";
import TitleCard from "./TitleCard";
import { VisXYContainer, VisLine, VisAxis } from '@unovis/react'
import { Scale } from '@unovis/ts'
import { useCallback } from "react";

function GraphCard(props) {

    const {title, dataX, dataY, curveType=null} = props;

    const [data, changeData] = useState(null);
    useEffect(() => {
        changeData(dataX.map((e, i) => (
            {
                x: e,
                y: dataY[i]
            }
        )));
    }, [dataX, dataY]);

    const options = {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
      };

    const xScale = useMemo(() => Scale.scaleTime(), []);
    return (
        
        <TitleCard title={title}>
            <VisXYContainer data={data} xScale={xScale}>
                <VisLine
                x={useCallback(d => (new Date(d.x*1000)), [])}
                y={useCallback(d => d.y, [])}></VisLine>
                <VisAxis type="x" numTicks={dataY.length/10} label="Date" tickFormat={Intl.DateTimeFormat('default', options).format}></VisAxis>
                <VisAxis type="y"></VisAxis>
            </VisXYContainer>
        </TitleCard>
    )
}

export default GraphCard;