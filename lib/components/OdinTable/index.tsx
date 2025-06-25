import { createContext, useContext } from "react";
import type { CSSProperties } from "react";
import { Table } from "react-bootstrap";
import { JSON, NodeJSON } from "../../helpers/types";

interface OdinTableProps extends React.ComponentProps<typeof Table> {
    columns: {[key: string]: string};
    header?: boolean;
    widths?: {[key: string]: CSSProperties["width"]};
}

interface OdinTableRowProps {
    row: {[key: string] : Exclude<JSON, NodeJSON | JSON[]>};
}

interface OdinTableContext_t {
    column_keys: string[];
    widths: {[key: string]: CSSProperties["width"]};
}

const OdinTableContext = createContext<OdinTableContext_t>({column_keys: [], widths: {}});

export const OdinTableRow: React.FC<OdinTableRowProps> = (props) => {
    const ctx = useContext(OdinTableContext);
    const {row} = props;

    let col_styles: {[key: string]: CSSProperties} = {};

    ctx?.column_keys.forEach((cell_name) => {
        col_styles[cell_name] = (cell_name in ctx.widths) ? {width: ctx.widths[cell_name]} : {};
    });

    return (
        <tr>
            {
                ctx.column_keys.map((col_name) => (
                    <td key={col_name} style={col_styles[col_name]}>{row[col_name]}</td>
                ))
            }
        </tr>
    );

}


export const OdinTable: React.FC<OdinTableProps> = (props) => {
    
    const {columns, header = true, widths = {}, children, ...leftoverProps } = props;
    const column_keys = Object.keys(columns);

    const tableDefaults: React.ComponentProps<typeof Table> = {responsive: true, striped: true};
    const tableProps = Object.assign(tableDefaults, leftoverProps);

    const renderHeader = () => {
        return (
            <thead>
                <tr>
                    {
                        Object.entries(columns).map( ([col_keys, col_name]) => (
                            <th key={col_keys} style={col_keys in widths ? {width: widths[col_keys]} : {}}>{col_name}</th>
                        ))
                    }
                </tr>
            </thead>
        )
    }
    return (
        <Table {...tableProps}>
            {header && renderHeader()}
            <tbody>
                <OdinTableContext.Provider value={{column_keys, widths}}>
                    {children}
                </OdinTableContext.Provider>
            </tbody>
        </Table>
    )

}