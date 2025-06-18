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
            <Col xs="6">
                <OdinLiveView endpoint={liveviewEndpoint} title="Live View"/>
            </Col>
            <Col xs="6">
                <TitleCard title="Filler">

                </TitleCard>
            </Col>
            </Row>
        </Container>
    )
}