import { Container, Row, Col } from "react-bootstrap"

import { OdinLiveView, ParamTree, TitleCard, useAdapterEndpoint } from "../";

interface LiveViewParam extends ParamTree {
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

export const LiveViewPage: React.FC = () => {

    const liveviewEndpoint = useAdapterEndpoint<LiveViewParam>("live_view", import.meta.env.VITE_ENDPOINT_URL);

    return (
        <Container>
            <Row>
            <Col xs="4">
                <OdinLiveView endpoint={liveviewEndpoint}/>
            </Col>
            <Col xs="4">
                <OdinLiveView endpoint={liveviewEndpoint}
                addrs={{clip_range_addr: "not/real",
                        colormap_options_addr: "not/real",
                        frame_num_addr: "not/real"
                }}/>
            </Col>
            <Col xs="4">
                <TitleCard title="Just Image Test">
                    <OdinLiveView endpoint={liveviewEndpoint} justImage/>
                </TitleCard>
            </Col>
            </Row>
        </Container>
    )
}