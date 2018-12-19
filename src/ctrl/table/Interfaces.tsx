import * as React from "react";
import {IFilter} from "../filters/Intefaces";
import {Row} from "frontend/src/ctrl/table/Tbody";

export interface IColumnData {
    field?: string;
    caption?: string;
    isSortable?: boolean;
    display?: boolean;
    toolTip?: ICellTemplate;
    width?: number | string | null;
    class?: string[];
    type?: string;
    orderField?: string;
    icon?: string | JSX.Element;
    append?: string | JSX.Element;
    prepend?: string | JSX.Element;
    classTemplate?: (row: any, column: IColumnData) => string[];
    styleTemplate?: (row: any, column: IColumnData) => any;
    rowSpan?: number | null;
    template?: ICellTemplate;
    default?: string;
    order?: string;
    header?: {
        icon?: string,
        tooltip?: string,
    };
    events?: {
        click?: IEventCallback[],
        mouseUp?: IEventCallback[],
        enter?: IEventCallback[],
        leave?: IEventCallback[],
    };
    filter?: IFilter[];
}

export type ICellTemplate = (value: string, row: any, column: IColumnData) => string | JSX.Element;

export type IEventCallback = (row: any, column: IColumnData, rowComponent: Row, cell: HTMLElement, event: any) => any;

export interface IFilterValue {
    field: string;
    value: any;
    condition: string;
    caption: string;
    labelCaptionSeparator: string;
    label: string;
}

export interface IOrder {
    field: string;
    dir: string;
}
