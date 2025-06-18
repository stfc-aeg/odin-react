import type { ReactNode } from 'react';
import type { AdapterEndpoint_t, NodeJSON } from '../../types';

import React, { useCallback, useEffect, useState, useRef } from 'react';

import defaultImg from '../../assets/odin.png';

import { Row, Col, Button, Dropdown, ButtonGroup } from 'react-bootstrap';
import { OverlayTrigger, Popover, Card} from 'react-bootstrap';


import style from './styles.module.css';
import { WithEndpoint } from '../WithEndpoint';
import { OdinDoubleSlider } from '../OdinDoubleSlider';

interface LiveViewProps {
    title?: ReactNode;
    endpoint: AdapterEndpoint_t<LiveViewParam>;
    path?: string;
    interval?: number;
}

interface ZoomableImageProps {
    src: string;
    caption?: string;

}

interface LiveViewParam extends NodeJSON {
    frame: {
        dtype: string;
        shape: number[];
        frame_num: number;
    }
    colormap_options: Record<string, string>;
    colormap_selected: string;
    data_min_max: [number, number];
    clip_range: [number, number];

}

const EndpointDropdown = WithEndpoint(Dropdown);
const EndpointSlider = WithEndpoint(OdinDoubleSlider);

export const ZoomableImage: React.FC<ZoomableImageProps> = (props) => {

    const {src, caption } = props;

    const [dims, setDims] = useState([1024, 1024]);
    const [dragStart, setDragStart] = useState([0, 0]);
    const [scale, setScale] = useState(100);
    // const [overlayVisible, setVisible] = useState<CSSProperties["visibility"]>("hidden");

    const imgRef = useRef<HTMLImageElement>(null);

    const onLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
        let target = event.target as HTMLImageElement;
        setDims([target.naturalWidth, target.naturalHeight]);
    }

    const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (event) => {
        if(event.buttons & 1){ // if button that triggered event is left click
            setDragStart([event.screenX, event.screenY]);
        }
    }

    const onDrag: React.MouseEventHandler<HTMLImageElement> = (event) => {
        event.preventDefault();
        if(event.buttons & 1){ // check if primary button active (left click)
            let img = imgRef.current!;
            let parent = img.parentElement!;
            let y = parent.scrollTop;
            let x = parent.scrollLeft;

            let mouseDiffX = event.screenX - dragStart[0];
            let mouseDiffY = event.screenY - dragStart[1];
            setDragStart([event.screenX, event.screenY]);
            img.parentElement!.scrollTo(x - mouseDiffX, y - mouseDiffY);
        }
    }

    return (
        <figure className={style.figure}>
            <div className={style.liveImg}>
                <img src={src} onLoad={onLoad} width={dims[0]*(scale/100)}
                     onMouseMove={onDrag} onMouseDown={onMouseDown} ref={imgRef}
                     draggable={false}/>
                
            </div>
            {caption && <figcaption>{caption}</figcaption>}
            <Row className={style.zoomOverlay}>
                <Col></Col>
                <Col xs="auto">
                <ButtonGroup size='sm'>
                <Button title="Zoom In" variant="secondary" onClick={() => setScale(oldScale => oldScale+10)}>+</Button>
                <Button title='Reset Zoom' variant='secondary' onClick={() => setScale(100)}>{`${scale}%`}</Button>
                <Button title="Zoom Out" variant="secondary" onClick={() => setScale(oldScale => Math.max(oldScale-10, 10 ))}>-</Button>
                </ButtonGroup>
                </Col>
            </Row>
        </figure>
    )
}

export const OdinLiveView: React.FC<LiveViewProps> = (props) => {
    const { title="Live View", path="image", endpoint, interval=1000 } = props;
    
    const [imgPath, setImgPath] = useState(defaultImg);
    const [enable, setEnable] = useState(true);
    const [frameNum, setFrameNum] = useState(0);

    const refreshImage = useCallback(() => {
        endpoint.get<Blob>(path, {responseType: "blob"})
        .then(result => {
            URL.revokeObjectURL(imgPath);  // memory management
            const img_url = URL.createObjectURL(result);
            if(endpoint.data){
                endpoint.get("frame/frame_num")
                .then(result => {
                    endpoint.mergeData(result, "frame/frame_num");
                    setFrameNum(Object.values(result)[0] as number);
                }).catch((error) => {
                    console.error(error);
                    setFrameNum(-1);
                })
            }
            setImgPath(img_url);
        }).catch((error) => {
            console.error("IMAGE GET FAILED: ", error);
            setImgPath(defaultImg);
        })
    }, [endpoint.updateFlag]);

    useEffect(() => {
        let timer_id: NodeJS.Timeout;
        if(enable){
            timer_id = setInterval(refreshImage, interval);
        }

        return () => clearInterval(timer_id);
    }, [interval, refreshImage, enable]);

    const renderOptions = (
        <Popover>
            <Popover.Header>Options</Popover.Header>
            <Popover.Body>
                <div className='d-grid gap-2'>
                <EndpointDropdown endpoint={endpoint} event_type='select' fullpath='colormap_selected'
                    className="d-grid">
                        <Dropdown.Toggle id="colormap_dropdown">
                            {endpoint.data.colormap_selected ?
                            endpoint.data.colormap_options[endpoint.data.colormap_selected]
                            : "Unknown"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {endpoint.data.colormap_options ? 
                                Object.entries(endpoint.data.colormap_options).map(([key, value], index) => (
                                    <Dropdown.Item eventKey={key} key={index}>{value}</Dropdown.Item>
                                )): <></>
                                
                            }
                        </Dropdown.Menu>
                </EndpointDropdown>
                <EndpointSlider endpoint={endpoint} title='Data Clipping' fullpath='clip_range'
                    min={endpoint.data.data_min_max?.[0] ?? 0} max={endpoint.data.data_min_max?.[1] ?? 1024}/>
                </div>
            </Popover.Body>
        </Popover>
    )

    return (
        <Card>
            <Card.Header>
                <Row>
                <Col className={style.centerContents}>{title}</Col>
                <Col xs="auto">
                <ButtonGroup>
                <Button onClick={() => setEnable(val => !val)}
                        variant={enable ? "secondary" : "outline-secondary"}
                        title={`Toggle Live View ${enable ? "Off": "On"}`}>
                    {enable ? `\u2714` : "\u2716"}
                </Button>
                <OverlayTrigger placement='bottom-end' overlay={renderOptions} trigger="click" rootClose> 
                    <Button title='Options'>&equiv;</Button>
                </OverlayTrigger>
                </ButtonGroup>
                </Col>
                </Row>
            </Card.Header>
            <Card.Body className={style.centerContents}>
                <ZoomableImage src={imgPath} caption={`Frame Number: ${frameNum}`}/>
            </Card.Body>
        </Card>
    )
}