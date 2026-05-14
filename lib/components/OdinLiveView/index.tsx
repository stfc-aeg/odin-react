import type { ReactNode } from 'react';
import type { AdapterEndpoint as AdapterEndpoint, ParamNode } from '../AdapterEndpoint';
import { getValueFromPath } from '../AdapterEndpoint';

import React, { useCallback, useEffect, useState, useRef } from 'react';

import defaultImg from '../../assets/odin.png';

import { Row, Col, Button, Dropdown, ButtonGroup, OverlayTriggerProps } from 'react-bootstrap';
import { OverlayTrigger, Popover, Card } from 'react-bootstrap';

import { ZoomIn, ZoomOut, PauseFill, PlayFill, List, ArrowsAngleContract, ArrowsAngleExpand } from 'react-bootstrap-icons';

import style from './styles.module.css';
import { WithEndpoint } from '../WithEndpoint';
import { OdinDoubleSlider } from '../OdinDoubleSlider';

interface LiveViewProps {
    /** What to display in the Card Header */
    title?: ReactNode;
    /** The endpoint to get the image from*/
    endpoint: AdapterEndpoint<LiveViewParam>;
    /** The path to the image on the adapter's Param Tree */
    img_path?: string;
    /** How often to request the image from the Adapter, in Milliseconds */
    interval?: number;
    /** If the Adapter is not the standard Live View Adapter, you can specify paths to
     * the various controls with this Prop
     */
    addrs?: Partial<LiveViewerAddrs>;
    /** Set to true to render the Live View as a standalone image without the Card container */
    justImage?: boolean;
}

interface ControlsProps {
    ref: HTMLDivElement;
    placement?: OverlayTriggerProps["placement"];

}

interface ZoomableImageProps {
    /** The URL Source of the image*/
    src: string;
    /** A caption to display below the image*/
    caption?: string;
    /** Additonal Components to display in the Hover Overlay, next to the zoom controls */
    children?: ReactNode;
}

interface LiveViewParam extends ParamNode {
    frame: {
        frame_num: number;
    }
    colormap_options: Record<string, string>;
    colormap_selected: string;
    data_min_max: [number, number];
    clip_range: [number, number];

}

interface LiveViewerAddrs {
    min_max_addr: string;
    clip_range_addr: string;
    colormap_options_addr: string;
    colormap_selected_addr: string;
    frame_num_addr: string;
}

const EndpointDropdown = WithEndpoint(Dropdown);
const EndpointSlider = WithEndpoint(OdinDoubleSlider);

/**
 * An image rendering component that provides the ability to zoom into
 * and drag around the image within its container. Used by {@link OdinLiveView},
 * but also available as a standalone component for other potential uses.
 * 
 * @param {ZoomableImageProps} props 
 * @param {string} props.src the URL of the image to display
 * @param {string} props.caption An optional caption to display below the image
 * @param {ReactNode} props.children Any additional components to render alongside
 * the Zoom controls overlay, such as additional buttons
 */
const ZoomableImage = ({ src, caption, children }: ZoomableImageProps) => {

    const [dims, setDims] = useState([1024, 1024]);
    const [divWidth, setDivWidth] = useState(500);
    const [dragStart, setDragStart] = useState([0, 0]);
    const [scale, setScale] = useState(100);
    // const [overlayVisible, setVisible] = useState<CSSProperties["visibility"]>("hidden");

    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setScale(getFitScale());
    }, [imgRef.current, dims[0]]);

    const onLoad: React.ReactEventHandler<HTMLImageElement> = (event) => {
        const target = event.target as HTMLImageElement;
        const parent = target.parentElement as HTMLDivElement;
        setDims([target.naturalWidth, target.naturalHeight]);
        setDivWidth(parent.clientWidth);
    }

    const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (event) => {
        if (event.buttons & 1) { // if button that triggered event is left click
            setDragStart([event.screenX, event.screenY]);
        }
    }

    const onDrag: React.MouseEventHandler<HTMLImageElement> = (event) => {
        event.preventDefault();
        if (event.buttons & 1) { // check if primary button active (left click)
            const img = imgRef.current!;
            const parent = img.parentElement!;
            const y = parent.scrollTop;
            const x = parent.scrollLeft;

            const mouseDiffX = event.screenX - dragStart[0];
            const mouseDiffY = event.screenY - dragStart[1];
            setDragStart([event.screenX, event.screenY]);
            img.parentElement!.scrollTo(x - mouseDiffX, y - mouseDiffY);
        }
    }

    const getFitScale = () => {
        // gets the scale we need to apply to the image to make it fit the container its in
        return (divWidth / dims[0]) * 100;
    }

    return (
        <figure className={style.figure}>
            <div className={style.liveImg} style={{ aspectRatio: `${dims[0]} / ${dims[1]}` }}>
                <img src={src} onLoad={onLoad} width={dims[0] * (scale / 100)}
                    onMouseMove={onDrag} onMouseDown={onMouseDown} ref={imgRef}
                    draggable={false} />

            </div>
            {caption && <figcaption>{caption}</figcaption>}
            <Row className={style.zoomOverlay}>
                {children && <Col xs="auto">{children}</Col>}
                <Col xs="auto">
                    <ButtonGroup size='sm'>
                        <Button title="Zoom Out" variant="secondary" onClick={() => setScale(oldScale => Math.max(oldScale - 10, 10))}>
                            <ZoomOut />
                        </Button>
                        <Button title='Reset Zoom' variant='secondary' onClick={() => setScale(getFitScale())}>
                            <ArrowsAngleContract />
                        </Button>
                        <Button title='Full Scale' variant='secondary' onClick={() => setScale(100)}>
                            <ArrowsAngleExpand />
                        </Button>
                        <Button title="Zoom In" variant="secondary" onClick={() => setScale(oldScale => oldScale + 10)}>
                            <ZoomIn />
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </figure>
    )
}


/**
 * Component designed to connect to a [Live View Adapter](https://github.com/odin-detector/odin-data/blob/master/python/src/odin_data/control/live_view_adapter.py)
 * to display the Live Image, as well as provide controls for value clipping and colourmapping, if available.
 * It can also work with other Adapters, so long as those adapters also provide the ability to request an Image via a HTTP Get request
 * on the parameter tree structure.
 * 
 * If an alternate Adapter is used that does not provide all the controls that the Live View Adapter does, such as Colourmapping or Clipping,
 * the controls for those will not render as part of the Component.
 * 
 * Can be rendered either within a `Bootstrap Card`, or as a standalone image
 */
const OdinLiveView = (
    { title = "Live View", img_path = "image",
        endpoint, interval = 1000, addrs = {}, justImage }: LiveViewProps
) => {

    const [imgPath, setImgPath] = useState(defaultImg);
    const [enable, setEnable] = useState(true);
    const [frameNum, setFrameNum] = useState(0);

    const [colormap_options, setColormapOptions] = useState<LiveViewParam["colormap_options"]>();
    const [colormap_selected, setColormapSelected] = useState<LiveViewParam["colormap_selected"]>("");
    const [data_min_max, setDataMinMax] = useState<LiveViewParam["data_min_max"] | undefined>();
    const [clip_range, setClipRange] = useState<LiveViewParam["clip_range"] | undefined>();


    const { min_max_addr = "data_min_max",
        clip_range_addr = "clip_range",
        colormap_options_addr = "colormap_options",
        colormap_selected_addr = "colormap_selected",
        frame_num_addr = "frame/frame_num" } = addrs;

    const div = useRef<HTMLDivElement>(null);

    const refreshImage = () => {
        endpoint.get<Blob>(img_path, { responseType: "blob" })
            .then(result => {
                URL.revokeObjectURL(imgPath);  // memory management
                const img_url = URL.createObjectURL(result);
                setImgPath(img_url);
                endpoint.get("");
            }).catch((error) => {
                console.error("IMAGE GET FAILED: ", error);
                setImgPath(defaultImg);
            })
    }

    useEffect(() => {
        let timer_id: NodeJS.Timeout;
        if (enable) {
            timer_id = setInterval(refreshImage, interval);
        }

        return () => clearInterval(timer_id);
    }, [interval, refreshImage, enable]);

    useEffect(() => {
        setColormapOptions(getValueFromPath(endpoint.data, colormap_options_addr));
        setColormapSelected(getValueFromPath(endpoint.data, colormap_selected_addr) ?? "");
        setDataMinMax(getValueFromPath(endpoint.data, min_max_addr));
        setClipRange(getValueFromPath(endpoint.data, clip_range_addr));
        setFrameNum(getValueFromPath(endpoint.data, frame_num_addr) ?? -1);


    }, [endpoint.data]);

    const renderOptions = (
        <Popover>
            <Popover.Header>Options</Popover.Header>
            <Popover.Body>
                <div className='d-grid gap-2'>
                    {(colormap_selected && colormap_options) &&
                        <EndpointDropdown endpoint={endpoint} event_type='select' fullpath={colormap_selected_addr}
                            className="d-grid">
                            <Dropdown.Toggle id="colormap_dropdown">
                                {colormap_options[colormap_selected]}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {colormap_options ?
                                    Object.entries(colormap_options).map(([key, value], index) => (
                                        <Dropdown.Item eventKey={key} key={index} active={key == colormap_selected}>
                                            {value}
                                        </Dropdown.Item>
                                    )) : <></>

                                }
                            </Dropdown.Menu>
                        </EndpointDropdown>
                    }
                    {clip_range &&
                        <EndpointSlider endpoint={endpoint} title='Data Clipping' fullpath={clip_range_addr}
                            min={data_min_max?.[0] ?? 0} max={data_min_max?.[1] ?? 1024} />
                    }
                </div>
            </Popover.Body>
        </Popover>
    )

    if (justImage) {
        return (
            <ZoomableImage src={imgPath} caption={frameNum > -1 ? `Frame Number: ${frameNum}` : ""}>
                <ButtonGroup size='sm' ref={div}>
                    <Button onClick={() => setEnable(val => !val)}
                        variant="secondary"
                        title={`${enable ? "Disable" : "Enable"} Live View`}>
                        {enable ? <PauseFill /> : <PlayFill />}
                    </Button>
                    {((colormap_options && colormap_selected) || clip_range) &&
                        <OverlayTrigger placement="bottom" overlay={renderOptions}
                            trigger="click" rootClose container={div}>
                            <Button title='Options'><List /></Button>
                        </OverlayTrigger>
                    }
                </ButtonGroup>
            </ZoomableImage>

        )
    } else {
        return (
            <Card>
                <Card.Header>
                    <Row>
                        <Col className={style.centerContents}>{title}</Col>
                        <Col xs="auto">
                            <ButtonGroup size='sm' ref={div}>
                                <Button onClick={() => setEnable(val => !val)}
                                    variant="secondary"
                                    title={`${enable ? "Disable" : "Enable"} Live View`}>
                                    {enable ? <PauseFill /> : <PlayFill />}
                                </Button>
                                {((colormap_options && colormap_selected) || clip_range) &&
                                    <OverlayTrigger placement="bottom" overlay={renderOptions}
                                        trigger="click" rootClose container={div}>
                                        <Button title='Options'><List /></Button>
                                    </OverlayTrigger>
                                }
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className={style.centerContents}>
                    <ZoomableImage src={imgPath} caption={frameNum > -1 ? `Frame Number: ${frameNum}` : ""} />
                </Card.Body>
            </Card>
        )
    }
}

export { ZoomableImage, OdinLiveView };