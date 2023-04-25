import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "react-bootstrap/Image";


/**
 * An updating image component, that will request an image from an adapter repeatedly
 * Most common use is to display a Live View of the data
 * 
 * @param defaultSrc  The default image src, displayed if there is an error
 * @param refreshRate The refresh rate for the image, in milliseconds. Default is 1 second
 * @param adapter     The name of the adapter this image should come from. NOTE: NOT AN ENDPOINT
 * @param imgpath     The path within the adapter to get the image from
 * @returns 
 */
function LiveViewImage(props) {

    const {defaultSrc, refreshRate = 1000, adapter, imgpath, ...remainingProps} = props;

    const [imgPath, setImgPath] = useState(defaultSrc);
    
    const refreshImage = useCallback(async (path=imgpath) => {
        let fullPath = `${process.env.REACT_APP_ENDPOINT_URL}/api/0.1/${adapter}/${path}`;
        let timestampPath = fullPath + "?" + new Date().getTime();
        setImgPath(timestampPath);
    })

    const onError = useCallback(() => {
        setImgPath(defaultSrc);
    });

    useEffect(() => {
        let timer = setInterval(refreshImage, refreshRate);

        return () => clearInterval(timer);
    }, [defaultSrc, refreshRate])
    

    return (
        <Image src={`${imgPath}`} onError={onError} {...remainingProps}/>

    )
}

export default LiveViewImage;