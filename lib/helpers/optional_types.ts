import type {Layout} from "plotly.js"

export interface GraphData {
    data: number[];
    axis?: number;
}

export interface Axis {
    side?: Layout["yaxis"]["side"];
    range?: [number, number];
    invert?: boolean;
    title?: Layout["yaxis"]["title"];
    visible?: boolean;
}

export const isGraphData = (x: Object[]): x is GraphData[] => {
    return "data" in x[0] && Array.isArray(x[0].data) && typeof x[0].data[0] === "number"
}
