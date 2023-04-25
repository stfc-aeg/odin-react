import React, { useEffect, useState, useRef } from 'react';

function ScopeCanvas(props) {

    
    const {data, backColor="#181818", 
                 axisColor="#ddffdd",
                 dataColor=['red', "blue", "green"],
                 lineThickness=2,
                 drawPoints=false,
                 drawAxis=true,
                 drawKey=true,
                 graphWidth=0.95,
                 graphHeight=1,
                 canvasHeight=400,
                 isTimeBased=false,
                 xLowerBound=null,
                 xUpperBound=null,
                 yLowerBound=null,
                 yUpperBound=null,
                 ...rest} = props;

    const [scopeData, changeScopeData] = useState(data);

    const [minX, changeMinX] = useState(xLowerBound);
    const [maxX, changeMaxX] = useState(xUpperBound);
    const [minY, changeMinY] = useState(yLowerBound);
    const [maxY, changeMaxY] = useState(yUpperBound);

    const [graphX, changeGraphX] = useState([0, 0]);
    const [graphY, changeGraphY] = useState([0, 0]);

    const [datasetLabels, changeDatasetLabels] = useState(null);

    // const [graphWidth, changeGraphWidth] = useState(1); //percentage
    // const [graphHeight, changeGraphHeight] = useState(1); //percentage

    const dataCanvasRef = useRef(null)
    const axisCanvasRef = useRef(null)
    const keyCanvasRef = useRef(null)

    const [canvasWidth, changeCanvasWidth] = useState(0);

    const axis_pos = 25

    const map = (value, inMin, inMax, outMin, outMax) => Math.floor((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);


    useEffect(() => {
        // effect that changes states when data changes

        changeScopeData(data);
        const canvas = dataCanvasRef.current
        // console.log(canvas)
        const context = canvas.getContext("2d")
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        // canvas.style.height = canvasHeight;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        changeGraphX([axis_pos, Math.floor(canvas.width*graphWidth)]);
        changeGraphY([Math.floor(canvas.height-(canvas.height*graphHeight)), (canvas.height)-axis_pos]);
        changeCanvasWidth(canvas.width)

        var allXes = [];
        var allYes = [];

        var temp_datasetLabels = [];
        // console.log(data[0])
        data.map(element => allXes.push(...element.x));
        data.map(element => allYes.push(...element.y));
        data.map(element => temp_datasetLabels.push(element.label));

        if(xLowerBound === null){changeMinX(Math.min(...allXes))};
        if(xUpperBound === null){changeMaxX(Math.max(...allXes))};
        if(yLowerBound === null){changeMinY(Math.min(...allYes))};
        if(yUpperBound === null){changeMaxY(Math.max(...allYes))};
        changeDatasetLabels(datasetLabels);

    }, [data])

    const doDrawData = (ctx, data) => {
        // console.log("data")
        let canvas = ctx.canvas
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backColor;
        // ctx.fillRect(graphX[0], graphY[0], graphX[1], graphY[1]);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = lineThickness
        ctx.lineJoin = "round";

        data.forEach((element, i) => {
            ctx.strokeStyle = dataColor[i];
            ctx.lineWidth = lineThickness
            ctx.beginPath();
            
            element.x.forEach((xValue, j) => {
                let x = map(xValue, minX, maxX, graphX[0], graphX[1])
                let y = map(element.y[j], minY, maxY+1, graphY[1], graphY[0])
                ctx.lineTo(x, y)
            })
            ctx.stroke();

            
            if(drawPoints){
                ctx.fillStyle = dataColor[i];
                element.x.forEach((xValue, j) => {
                    ctx.beginPath();
                    let x = map(xValue, minX, maxX, graphX[0], graphX[1])
                    let y = map(element.y[j], minY, maxY+1, graphY[1], graphY[0])
                    ctx.arc(x, y, (lineThickness/2)+2, 0, 2*Math.PI)
                    ctx.fill()

                })
            }
        });

    }

    useEffect(() => {
        // effect that draws the datasets when data changes
        const canvas = dataCanvasRef.current
        const context = canvas.getContext("2d")

        // let frameCount = 0
        let animationFrameId

        const render = () => {
            // frameCount++;
            resizeCanvasToDisplaySize(canvas)
            doDrawData(context, scopeData);
            animationFrameId = window.requestAnimationFrame(render)
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [scopeData, doDrawData]);

    useEffect(() => {
        //redraws the axis when their scale changes
        // console.log("Redrawing Axis")
        const canvas = axisCanvasRef.current
        const context = canvas.getContext("2d")

        const render = () => {
            resizeCanvasToDisplaySize(canvas)
            doDrawAxis(context, scopeData);
        }
        render();
    }, [minX, maxX, minY, maxY, canvasWidth])

    useEffect(() => {
        //redraws the Key when the dataset names change (unlikely to be often)
        console.log("Redrawing Key")
        const canvas = keyCanvasRef.current
        const context = canvas.getContext("2d")

        const render = () => {
            resizeCanvasToDisplaySize(canvas)
            doDrawKey(context, scopeData);
        }
        render();
    }, [datasetLabels, canvasWidth])

    const doDrawKey = (ctx, data) => {
        const keyWidth = ctx.canvas.width - graphX[1]
        if(!(keyWidth > 0)){
            return
        }
        ctx.strokeStyle = axisColor;
        ctx.rect(graphX[1], graphY[0], ctx.canvas.width, graphY[1])
        ctx.textAlign = "center"
        const textKey = "Key";
        const textMetrics = ctx.measureText(textKey);
        const upperMargin = textMetrics['fontBoundingBoxAscent']
        ctx.fillText("Key", graphX[1] + keyWidth/2, graphY[0]+upperMargin)

        ctx.stroke();

        ctx.textAlign = "left"
        data.forEach((element, i) => {
            ctx.beginPath();
            ctx.fillStyle = dataColor[i];
            var y = graphY[0] + ((i+2)*upperMargin)
            ctx.arc(graphX[1] + 10, y, (lineThickness/2)+2, 0, 2*Math.PI)
            ctx.fill()
            ctx.fillText(element.label, graphX[1] + 12, y+(upperMargin/2))
        })
    }

    const doDrawAxis = (ctx, data) => {
        let canvas = ctx.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath()
        ctx.strokeStyle = axisColor
        // ctx.fillStyle = backColor
        ctx.lineWidth = 2
        ctx.moveTo(graphX[0], graphY[1])
        ctx.lineTo(graphX[1], graphY[1])
        ctx.moveTo(graphX[0], graphY[0])
        ctx.lineTo(graphX[0], graphY[1])
        ctx.stroke();

        // ctx.fillRect(0, 0, axis_pos-1, canvas.height)
        // ctx.fillRect(0, 1+canvas.height-axis_pos, canvas.width, canvas.height)

        ctx.font = "12px Arial";

        ctx.fillStyle = axisColor
        
        ctx.textAlign = "left"
        for(var i = minX; i<maxX+1; i++){
            let x = map(i, minX, maxX, axis_pos, graphX[1])
            ctx.moveTo(x, graphY[1]);
            ctx.lineTo(x, graphY[1] + axis_pos)
            if(isTimeBased){
                let timestamp = new Date(i*1000)
                var hours = "0" + timestamp.getHours()
                var min = "0" + timestamp.getMinutes()
                var sec = "0" + timestamp.getSeconds()
                var millisec = "" + timestamp.getMilliseconds()
                ctx.fillText(hours.slice(-2) + ":" + min.slice(-2) + ":" + sec.slice(-2) +":" + millisec.charAt(0), x + 2, graphY[1] + axis_pos)
            }else{
                ctx.fillText(i, x + 2, graphY[1] + axis_pos)
            }
        }

        ctx.textAlign = "right"
        for(var i = Math.floor(minY); i<maxY+2; i++){
            let y = map(i, minY, maxY+1, graphY[1], graphY[0])
            ctx.moveTo(axis_pos, y);
            ctx.lineTo(axis_pos/2, y)
            if(!(i%2)){
                ctx.fillText(i, (axis_pos/2), y-2)
            }
        }
        ctx.stroke()
    }



    function resizeCanvasToDisplaySize(canvas) {
        const {width, height} = canvas.getBoundingClientRect()
        // height = canvasHeight;
        if(canvas.width !== width || canvas.height !== canvasHeight) {
            canvas.width = width
            canvas.height = canvasHeight
        }

    }

    return (
    <div style={{position: "relative"}}>
        <canvas ref={dataCanvasRef} width={canvasWidth} height={canvasHeight} style={{zIndex: 0}}></canvas>
        <canvas ref={axisCanvasRef} width={canvasWidth} height={canvasHeight} style={{position: "absolute", top: 0, left: 0, zIndex: 1}}></canvas>
        <canvas ref={keyCanvasRef} width={canvasWidth} height={canvasHeight} style={{ position: "absolute", top: 0, left: 0, zIndex: 2}}></canvas>
    </div>
    )
}


export default ScopeCanvas