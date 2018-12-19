import * as React from "react";
import { ICellTemplate, IColumnData, IEventCallback } from "./Interfaces";
import { Option } from "../fields/Interfaces";
import { DateFilter, NumericFilter, SelectFilter, SwitchFilter, TextFilter } from "../Filters";
import { IFilter } from "frontend/src/ctrl/filters/Intefaces";
import Icon from "frontend/src/ctrl/Icon";

export class ColumnHelper {
    protected data: IColumnData;

    constructor(initData: Partial<IColumnData>) {
        this.data = {
            events: {
                click: [],
                enter: [],
                leave: [],
                mouseUp: [],
            },
            filter: [],
            header: {},
            ...initData,
        };
    }

    public static id(field: string, caption: string): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            filter: [
                {
                    caption,
                    field,
                    component: NumericFilter,
                },
            ],
        }).className("right");
    }

    public static number(field: string, caption: string): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            filter: [
                {
                    caption,
                    field,
                    component: NumericFilter,
                },
            ],
        }).className("right");
    }

    public static map(field: string, caption: string, options: Option[] | object, multiSelectFilter: boolean = false): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            template: (value) => {
                if (Array.isArray(options)) {
                    const res = options.filter((e) => e.value == value);
                    if (res.length > 0) {
                        return res[0].label;
                    }
                    return "---";
                } else {
                    return options[value];
                }
            },
            filter: [
                {
                    field,
                    component: SelectFilter,
                    config: {
                        content: options,
                        multiselect: multiSelectFilter,
                    },
                },
            ],
        });
    }

    public static text(field: string, caption: string): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            filter: [
                {
                    caption,
                    // label: caption,
                    field,
                    component: TextFilter,
                    config: {
                        extendedInfo: true,
                    },
                },
            ],
        });
    }

    public static link(field: string, caption: string, urlResolver: any): ColumnHelper {
        return ColumnHelper.text("id", "").onMouseUp((row, column, e: React.MouseEvent<HTMLElement>) => {
            const url = urlResolver(row, column, event);
            if (e.button == 1) {
                window.open(url);
            } else {
                window.location.href = url;
            }
        });
    }

    public static money(field, caption): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            template: (val, row) => parseFloat(val).toFixed(2),
            filter: [
                {
                    field,
                    component: NumericFilter,
                },
            ],
        }).className("right");
    }

    public static email(field, caption): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            template: (val, row) => <a href={"mailto:" + val}>{val}</a>,
            filter: [
                {
                    field,
                    component: TextFilter,
                    config: {
                        extendedInfo: true,
                    },
                },
            ],
        });
    }

    public static date(field, caption): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,

            filter: [
                {
                    field,
                    component: DateFilter,
                },
            ],
        });
    }

    public static bool(field, caption): ColumnHelper {
        return new ColumnHelper({
            field,
            caption,
            classTemplate: (row, column) => ["center", row[column.field] == "1" ? "darkgreen" : "darkred"],
            template: (value) => <Icon name={value == "1" ? "CheckMark" : "Clear"} />,
            filter: [
                {
                    field,
                    component: SwitchFilter,
                    config: {
                        content: [{ value: 0, label: "Nie" }, { value: 1, label: "Tak" }],
                    },
                },
            ],
        });
    }

    public static hidden(field): ColumnHelper {
        return new ColumnHelper({
            field,
            display: false,
        });
    }

    public static template(caption: string, template: ICellTemplate): ColumnHelper {
        return new ColumnHelper({
            caption,
            template,
        }).noFilter();
    }

    public static custom(data): ColumnHelper {
        return new ColumnHelper(data);
    }

    editable(fn, type: string, enabled: boolean): ColumnHelper {
        if (enabled === false) {
            return this.data;
        }
        this.data.template = (value, row, column, rowContainer) => {
            let changedValue = value;
            if (column.inEditState == true) {
                switch (type) {
                    case "text":
                        return (
                            <div className={"global-input-column"}>
                                <input
                                    type="text"
                                    onChange={(e) => (changedValue = e.target.value)}
                                    defaultValue={value}
                                    autoFocus={true}
                                    onBlur={() => {
                                        if (value !== changedValue) {
                                            fn(column, row, changedValue);
                                        }
                                        column.inEditState = false;
                                        rowContainer.forceUpdate();
                                    }}
                                />
                            </div>
                        );
                        break;
                    case "textarea":
                        return (
                            <div className={"global-input-column"}>
                                <textarea
                                    autoFocus={true}
                                    onChange={(e) => (changedValue = e.target.value)}
                                    defaultValue={value}
                                    onBlur={() => {
                                        if (value !== changedValue) {
                                            fn(column, row, changedValue);
                                        }
                                        column.inEditState = false;
                                        rowContainer.forceUpdate();
                                    }}
                                />
                            </div>
                        );
                        break;
                }
            } else {
                switch (type) {
                    case "text":
                        return (
                            <div className={"global-input-column global-input-column-disabled"}>
                                <input type="text" defaultValue={value} disabled={true} />
                            </div>
                        );
                        break;
                    case "textarea":
                        return (
                            <div className={"global-input-column global-input-column-disabled"}>
                                <textarea autoFocus={true} defaultValue={value} disabled={true} />
                            </div>
                        );
                        break;
                }
            }
        };
        this.data.events.click.push((row, column, rowContainer) => {
            column.inEditState = true;
            rowContainer.forceUpdate();
        });
        return this;
    }

    className(className: string): ColumnHelper {
        this.data.class = [className];
        return this;
    }

    public template(fn: ICellTemplate): ColumnHelper {
        this.data.template = fn;
        return this;
    }

    public append(x: any): ColumnHelper {
        this.data.append = x;
        return this;
    }

    public prepend(x: any): ColumnHelper {
        this.data.prepend = x;
        return this;
    }

    public width(x: any): ColumnHelper {
        this.data.width = x;
        return this;
    }

    public rowSpan(span: number) {
        this.data.rowSpan = span;
        return this;
    }

    public headerTooltip(text: string) {
        this.data.header.tooltip = text;
        return this;
    }

    public headerIcon(iconName: string) {
        this.data.header.icon = iconName;
        this.data.filter[0].caption = "xx";
        return this;
    }

    public addFilter(filter: IFilter | false) {
        if (filter !== false) {
            this.data.filter.push(filter);
        }
        return this;
    }

/*    public setSortField(field: string){
        this.data.sortField = field;
        this.data.isSortable = true;
        return this;
    }*/

    public noFilter(): ColumnHelper {
        this.data.filter = [];
        return this;
    }

    public noSorter(): ColumnHelper {
        this.data.isSortable = false;
        return this;
    }

    /*filter(type, field, conf) {
        if(Array.isArray(this.data.filter)){

        }else{

        }
    }*/

    public onClick(fn: IEventCallback): ColumnHelper {
        this.data.events.click.push(fn);
        return this;
    }

    public onMouseUp(fn: IEventCallback): ColumnHelper {
        this.data.events.mouseUp.push(fn);
        return this;
    }

    public onEnter(fn: IEventCallback): ColumnHelper {
        this.data.events.enter.push(fn);
        return this;
    }

    public onLeave(fn: IEventCallback): ColumnHelper {
        this.data.events.leave.push(fn);
        return this;
    }

    public styleTemplate(fn: (row: any, column: IColumnData) => any) {
        this.data.styleTemplate = fn;
        return this;
    }

    public classTemplate(fn: (row: any, column: IColumnData) => string[]) {
        this.data.classTemplate = fn;
        return this;
    }

    public set(el: Partial<IColumnData>): ColumnHelper {
        this.data = { ...this.data, ...el };
        return this;
    }

    public get(): IColumnData {
        return this.data;
    }
}
