import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "react-bootstrap/Image";



function LiveViewImage(props) {

    const {src, refreshRate = 1000, endpoint, imgpath} = props;

    const [imgSource, setImgSource] = useState(src);
    const [imgPath, setImgPath] = useState(src);
    
    const refreshImage = useCallback(async (path=imgpath) => {
        let fullPath = `${process.env.REACT_APP_ENDPOINT_URL}/api/0.1/${endpoint}/${path}`;
        let timestampPath = fullPath + "?" + new Date().getTime();
        console.log(timestampPath);
        setImgPath(timestampPath);
        // endpoint.get(timestampPath)
        // .then(result => {
        //     console.log(result);
            
        //     let binaryData = Buffer.from(result);
        //     // binaryData.push(result.split(""));
        //     console.log(binaryData);
        //     // setImgSource(binaryData);
        //     setImgSource(URL.createObjectURL(new Blob(binaryData, {type: "image/png"})));
        // });
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