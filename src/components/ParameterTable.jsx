import React from 'react';
import Table from 'react-bootstrap/Table';

const ParameterTableContext = React.createContext();

export const ParameterEntry = (props) => {

    const { name, value, unit = ""} = props;
    const ctx = React.useContext(ParameterTableContext);

    let cell_styles = {};
    ['name', 'value', 'unit'].forEach(cell_name => {
      cell_styles[cell_name] = (cell_name in ctx.widths) ? { width : ctx.widths[cell_name]} : {};
    });

    return (
      <tr>
        <td style={cell_styles.name}>{name}</td>
        <td style={cell_styles.value}>{value}</td>
        {ctx.unit && <td style={cell_styles.unit}>{unit}</td>}
      </tr>
    );
}

export const ParameterTable = (props) => {

    const { header = true, unit = true, widths = {}, paramTitle= "Parameter"} = props;

    const renderHeader = () => {
      return (
        <thead>
          <tr>
            <th>{paramTitle}</th>
            <th>Value</th>
            {unit && <th>Unit</th>}
          </tr>
        </thead>
      )
    }

    return (
        <Table striped hover>
        {header && renderHeader()}
        <tbody>
          <ParameterTableContext.Provider value={{ unit, widths }}>
            {props.children}
          </ParameterTableContext.Provider>
        </tbody>
      </Table>
    );
}

export default ParameterTable;