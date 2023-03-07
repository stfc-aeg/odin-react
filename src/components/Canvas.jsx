
import React, { useEffect, useRef } from 'react';

export const Canvas = (props) => {


    const {draw, canvasOptions, ...rest } = props;
    const canvasRef = useCanvas(draw, canvasOptions)

    return <canvas ref={canvasRef} {...rest}/>
}

export const  useCanvas = (draw, props={}) => {

    const canvasRef = useRef(null);

    useEffect(() => {
        
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        let frameCount = 0
        let animationFrameId

        const render = () => {
            frameCount++;
            draw(context, frameCount);
            animationFrameId = window.requestAnimationFrame(render)
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }

        // draw(context)
        // context.fillStyle = '#000000'
        // context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    }, [draw])

    return canvasRef;
}

export default Canvas