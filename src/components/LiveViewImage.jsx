import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "react-bootstrap/Image";



function LiveViewImage(props) {

    const {src, refreshRate = 1000, adapter, imgpath} = props;

    const [imgPath, setImgPath] = useState(src);
    
    const refreshImage = useCallback(async (path=imgpath) => {
        let fullPath = `${process.env.REACT_APP_ENDPOINT_URL}/api/0.1/${adapter}/${path}`;
        let timestampPath = fullPath + "?" + new Date().getTime();
        console.log(timestampPath);
        setImgPath(timestampPath);
    })

    useEffect(() => {
        let timer = setInterval(refreshImage, refreshRate);

        return () => clearInterval(timer);
    }, [src, refreshRate])
    

    return (
        <Image src={`${imgPath}`}/>

    )
}

export default LiveViewImage;