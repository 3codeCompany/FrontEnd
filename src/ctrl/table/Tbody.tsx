import * as React from "react";
import {deepIsEqual} from "frontend/src/lib/JSONTools";
import * as uuidv4 from "uuid/v4";
import Icon from "../Icon";
// const uuidv4 = require('uuid/v4');

export default class Tbody extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    public shouldComponentUpdate(nextProps, nextState) {
        return !deepIsEqual(
            [this.props.data, this.props.selection, this.props.columns, this.props.selectable],
            [nextProps.data, nextProps.selection, nextProps.columns, nextProps.selectable]
        );
    }

    public groupByGetInfo = (row1, row2) => {
        const info = [];
        for (const group of this.props.groupBy) {
            if (group.field !== undefined) {
                if (row1 === null || row1[group.field] != row2[group.field]) {
                    info.push({label: row2[group.field]});
                }
            } else if (group.equalizer !== undefined) {
                if (row1 === null || group.equalizer(row1, row2)) {
                    info.push({label: group.labelProvider(row2, row1)});
                }
            }
        }

        return info;
    };

    public render() {
        const props = this.props;

        const columns = props.columns.filter((el) => el !== null && el.display === true);

        const {order, filters} = this.props;
        const cache = {};

        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];
            cache[index] = cache[index] || {};
            cache[index].classes = [];
            if (order[column.field] !== undefined) {
                cache[index].classes.push("w-table-sorted w-table-sorted-" + order[column.field].dir);
            }
            if (filters[column.field] !== undefined) {
                cache[index].classes.push("w-table-filtered");
            }
            if (
                (column.events.click && column.events.click.length > 0) ||
                (column.events.mouseUp && column.events.mouseUp.length > 0)
            ) {
                cache[index].classes.push("w-table-cell-clickable");
            }
            cache[index].classes = cache[index].classes.concat(column.class);

            cache[index].style = null;
            if (column.width) {
                cache[index].style = {width: column.width};
            }
        }

        let lastRow: any = null;

        return props.data.map((row, index) => {
            // const key = row.id != undefined ? row.id : uuidv4();
            const key = uuidv4();
            const even = index % 2 == 0;

            const _row = (
                <Row
                    key={key}
                    even={even}
                    _key={key}
                    columns={columns}
                    row={row}
                    rowClassTemplate={props.rowClassTemplate}
                    rowStyleTemplate={props.rowStyleTemplate}
                    selectable={this.props.selectable}
                    isSelected={this.props.selection.includes(index)}
                    onCheck={() => this.props.onCheck(index)}
                    cache={cache}
                    infoRow={this.props.infoRow}
                />
            );

            if (this.props.groupBy.length > 0) {
                const groupData = this.groupByGetInfo(lastRow, row);
                if (groupData.length > 0) {
                    lastRow = row;
                    return [
                        <tr key={key + "_group"}>
                            <td style={{backgroundColor: "grey", color: "white"}} colSpan={columns.length + 1}>
                                {groupData.map((el) => <React.Fragment key={uuidv4()}>{el.label}</React.Fragment>)}
                            </td>
                        </tr>,
                        _row,
                    ];
                }
            }
            return _row;
        });
    }
}

export class Row extends React.PureComponent<any, any> {
    public packFn = (val, column, row) => {
        let templateResult = false;
        if (column.template !== null) {
            templateResult = column.template(val, row, column, this);
        }
        return (
            <>
                {column.icon !== null && <Icon name={column.icon}/>}
                {column.prepend !== null && column.prepend}
                {templateResult !== false ? templateResult : val ? val : column.default}
                {column.append !== null && column.append}
            </>
        );
    };

    public render() {
        const props = this.props;
        const {columns, row, cache, _key} = this.props;

        const rowProps: any = {};
        if (props.infoRow != null) {
            rowProps.className = this.props.even ? "w-table-row-even" : "w-table-row-odd";
        }
        if (props.rowClassTemplate !== null) {
            rowProps.className += " " + props.rowClassTemplate(row);
        }
        if (props.rowStyleTemplate !== null) {
            rowProps.style = props.rowStyleTemplate(row);
        }

        /*rowProps.onMouseEnter = () => {
            console.log("aaa");
        }*/

        return (
            <>
                <tr {...rowProps}>
                    {props.selectable && (
                        <td className={"w-table-selection-cell"} onClick={props.onCheck}>
                            <input
                                type="checkbox"
                                onChange={(event) => {
                                    event.stopPropagation();
                                    props.onCheck;
                                }}
                                checked={this.props.isSelected}
                            />
                        </td>
                    )}
                    {columns.map((column, index2) => {
                        let style = cache[index2].style;
                        if (column.styleTemplate !== null) {
                            style = {...style, ...column.styleTemplate(row, column)};
                        }
                        let className = null;
                        if (column.classTemplate !== null) {
                            className = cache[index2].classes.concat(column.classTemplate(row, column)).join(" ");
                        } else if (cache[index2].classes.length > 0) {
                            className = cache[index2].classes.join(" ");
                        }

                        const cellProps: any = {};

                        if (className !== null) {
                            cellProps.className = className;
                        }

                        if (style !== null && Object.keys(style).length !== 0) {
                            cellProps.style = style;
                        }

                        if (column.events.click.length > 0) {
                            cellProps.onClick = (event) => {
                                column.events.click.map((callback) => {
                                    callback.bind(this)(row, column, this, event.target, event);
                                });
                            };
                        }
                        if (column.events.mouseUp.length > 0) {
                            cellProps.onMouseUp = (event) => {
                                column.events.mouseUp.map((callback) => {
                                    callback.bind(this)(row, column, this, event.target, event);
                                });
                            };
                            cellProps.onContextMenu = (e) => e.preventDefault();
                        }

                        if (column.events.enter.length > 0) {
                            cellProps.onMouseEnter = (event) => {
                                column.events.enter.map((callback) => {
                                    callback.bind(this)(row, column, this, event.target);
                                });
                            };
                        }
                        if (column.events.leave.length > 0) {
                            cellProps.onMouseLeave = (event) => {
                                column.events.leave.map((callback) => {
                                    callback.bind(this)(row, column, this, event.target);
                                });
                            };
                        }

                        if (column.rowSpan !== null) {
                            cellProps.rowSpan = column.rowSpan;
                        }

                        return (
                            <td key={_key + index2} {...cellProps}>
                                {this.packFn(row[column.field] ? row[column.field] : column.default, column, row)}
                            </td>
                        );
                    })}
                </tr>

                {props.infoRow != null && (
                    <tr className={"w-table-info-row"} {...rowProps}>
                        <td colSpan={12}>{props.infoRow(row)}</td>
                    </tr>
                )}
            </>
        );
    }
}

const Cell = (props) => {
};
