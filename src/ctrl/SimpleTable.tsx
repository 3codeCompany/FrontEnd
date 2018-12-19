import * as React from "react";

interface ITableProps {
    fromFlatObject?: any
    children?: any
    header?: Array<any>

}

const SimpleTable: React.StatelessComponent<ITableProps> = (props) => {

    let children = React.Children.toArray(props.children);
    if (children == undefined) {
        children = [];
    }

    for (let i in props.fromFlatObject) {
        children.push(<SimpleTableRow key={i} cols={[i, props.fromFlatObject[i]]}/>)
    }

    return (
        <table className="w-simple-table">
            {props.header.length>0&&<thead><SimpleTableRow cols={props.header}/></thead>}
            <tbody>{children}</tbody>
        </table>
    )
}

SimpleTable.defaultProps = {
    fromFlatObject: {},
    header: []
}

interface ITableRowProps {
    cols: Array<any>
}

const SimpleTableRow: React.StatelessComponent<ITableRowProps> = (props) => {

    return (
        <tr>
            {props.cols.map((el, index) =>
                <td key={index}>{el}</td>
            )}
        </tr>
    )
}


export {SimpleTable, SimpleTableRow};
