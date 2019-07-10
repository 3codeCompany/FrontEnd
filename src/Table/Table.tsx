import { ReactElement, Ref, StatelessComponent } from "react";
import "./Table.sass";

declare var window: any;
declare var PRODUCTION: any;
import * as React from "react";
import { ColumnHelper } from "./ColumnHelper";
import FiltersPresenter from "./FiltersPresenter";
import Tbody from "./Tbody";
import Footer from "./Footer";
import { ICellTemplate, IColumnData, IFilterValue, IOrder } from "./Interfaces";
import { EmptyResult, Error, Loading } from "./placeholders";

import { Comm, CommEvents } from "../lib/Comm";
import Thead from "./Thead";
import { deepCopy, deepIsEqual } from "../lib/JSONTools";
import TextFilter from "../filters/TextFilter";
import { LoadingIndicator } from "../LoadingIndicator";
import { confirmDialog } from "../ConfirmDialog";


export interface IDataQuery {
    columns: IColumnData[];
    filters: { [key: string]: IFilterValue };
    order: { [index: string]: IOrder };
    onPage: number;
    currentPage: number;
    additionalConditions: any;
}

export interface ITableDataInput {
    data: any[];
    countAll?: number;
    debug?: string | boolean;
    decorator?: (requestData: IDataQuery, data: ITableDataInput) => Promise<ITableDataInput>;
}

type ISelectionChangeEvent = (selected: any[]) => any;

export type IRowClassTemplate = (row: any, index: number) => string;

export type IRowStyleTemplate = (row: any, index: number) => any;

export interface IGroupByData {
    field?: string;
    equalizer?: (prevRow: any, nextRow: any) => boolean;
    labelProvider?: (nextRow: any, prevRow: any) => string | ReactElement<any> | StatelessComponent;
}

interface ITableProps {
    remoteURL?: string;
    dataProvider?: (input: IDataQuery) => Promise<ITableDataInput>;
    selectable?: boolean;
    onSelectionChange?: ISelectionChangeEvent;
    controlKey?: string;
    onPage?: number;
    rememberState?: boolean;
    rowClassTemplate?: IRowClassTemplate;
    rowStyleTemplate?: IRowStyleTemplate;
    columns: IColumnData[] | ColumnHelper[];
    showFooter?: boolean;
    showHeader?: boolean;
    additionalConditions?: any;
    filters?: { [key: string]: IFilterValue };
    onFiltersChange?: (filtersValue: { [key: string]: IFilterValue }) => any;
    onDataChange?: (data: any, count: number) => any;
    data?: ITableDataInput;
    infoRow?: ICellTemplate;
    groupBy?: IGroupByData[];
}

interface ITableState {
    loading: boolean;
    firstLoaded: boolean;
    data: any[];
    dataSourceError: string;
    dataSourceDebug: boolean | string;
    filters: { [key: string]: IFilterValue };
    order: { [key: string]: IOrder };
    onPage: number;
    currentPage: number;
    countAll: number;
    fixedLayout: boolean; // props.fixedLayout,
    columns: IColumnData[];
    // bodyHeight: this.props.initHeight,
    allChecked: boolean;
    selection: any[];
    tooltipData: any;
}

export class Table extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        onPage: 25,
        columns: [],
        showFooter: true,
        showHeader: true,
        rememberState: false,
        additionalConditions: {},
        filters: null,
        data: { data: null, countAll: 0, debug: "" },
        rowClassTemplate: null,
        rowStyleTemplate: null,
        infoRow: null,
        onSelectionChange: null,
        groupBy: [],
    };
    private tmpDragStartY: number;
    private xhrConnection: XMLHttpRequest;
    private hashCode: string;
    public state: ITableState;
    private tooltipTimeout: number;

    private tableRef: HTMLTableElement;

    private columnWidths: number[] = [];

    constructor(props: ITableProps) {
        super(props);

        const processedColumns: IColumnData[] = [];
        for (const i in props.columns) {
            processedColumns[i] = this.prepareColumnData(props.columns[i]);
        }

        // console.log(columns);

        this.state = {
            loading: false,
            firstLoaded: false,
            data: this.props.data.data !== null ? this.props.data.data : [],
            dataSourceError: "",
            dataSourceDebug: false,
            filters: deepCopy(this.props.filters),
            order: {},
            onPage: this.props.onPage,
            currentPage: 1,
            countAll: this.props.data.countAll,
            fixedLayout: false, // props.fixedLayout,
            columns: processedColumns,
            // bodyHeight: this.props.initHeight,
            allChecked: false,
            selection: [],
            tooltipData: null,
        };

        // helpers
        this.tmpDragStartY = 0;
        this.xhrConnection = null;

        const hashCode = (s: any) => {
            return s.split("").reduce((a: any, b: any) => {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        };
        this.hashCode = hashCode(
            this.props.controlKey +
            (window.CONTROLS_BASE_LOCATION != undefined
                ? window.CONTROLS_BASE_LOCATION
                : window.location.pathname + window.location.hash.split("?")[0]),
        );

        this.tooltipTimeout = null;
    }

    public componentWillMount() {
        if (this.props.rememberState && window.localStorage[this.hashCode]) {
            const local = JSON.parse(window.localStorage[this.hashCode]);
            let filters = deepCopy(this.state.filters);
            // for controlable filters u cant overwrite them when table is mounting
            filters = { ...filters, ...local.filters };
            this.setState({ ...this.state, ...local, firstLoaded: false, filters }, () => {
                if (this.props.onFiltersChange) {
                    this.props.onFiltersChange(deepCopy(this.state.filters));
                }
            });
        }
    }

    public getData() {
        return this.state.data;
    }

    public componentDidUpdate(prevProps: ITableProps, prevState12436) {

        const state = this.state;
        if (this.props.rememberState) {
            window.localStorage[this.hashCode] = JSON.stringify({
                onPage: state.onPage,
                currentPage: state.currentPage,
                // bodyHeight: state.bodyHeight,
                filters: state.filters,
                order: state.order,
                fixedLayout: state.fixedLayout,
            });
        }
        if (prevProps.remoteURL != this.props.remoteURL) {
            this.load();
        }
    }

    public componentDidMount() {
        if (this.props.remoteURL || this.props.dataProvider) {
            this.load();
        }


        if (this.state.fixedLayout) {
            const th = this.tableRef.querySelectorAll("thead>tr>th");

            for (let i = 0; i < th.length; i++) {
                this.columnWidths.push(th[i].getBoundingClientRect().width);
                //var cs = window.getComputedStyle(z, null);
                // @ts-ignore
                th[i].style.width = (this.columnWidths[i] - 1) + "px";
                //console.log();
                //th[i].styles.width = this.columnWidths[i] + "px";
            }

            this.tableRef.querySelector("thead").classList.add("fixed-th");
            this.tableRef.querySelector("tbody").classList.add("fixed");

            console.log(this.columnWidths);
        }
    }

    /*shouldComponentUpdate(nextProps, nextState) {

        let should = false;

        if (!deepIsEqual(this.state.filters, nextState.filters)) {
            if (!PRODUCTION) {
                console.log("[Table] Filters diference")
            }
            return true;
        }
        if (!deepIsEqual(this.state.order, nextState.order)) {
            if (!PRODUCTION) {
                console.log("[Table] order diference")
            }
            return true;
        }
        if (!deepIsEqual(this.state.columns, nextState.columns)) {
            if (!PRODUCTION) {
                console.log("[Table] Columns diference")
            }
            return true;
        }
        let n = nextState;
        let p = this.state;
        if (!deepIsEqual(
                [
                    p.loading,
                    p.onPage,
                    p.currentPage,
                    p.allChecked,
                    p.selection,
                    p.dataSourceError,
                    p.dataSourceDebug
                ],
                [
                    n.loading,
                    n.onPage,
                    n.currentPage,
                    n.allChecked,
                    n.selection,
                    n.dataSourceError,
                    n.dataSourceDebug
                ]
            )) {
            if (!PRODUCTION) {
                console.log("[Table] Base state diference")
            }
            return true;
        }

        let np = nextProps;
        let pr = this.props;
        if (!deepIsEqual(
                [
                    pr.remoteURL,
                    pr.selectable,
                    pr.showFooter,
                    pr.showHeader,
                    pr.additionalConditions,
                ],
                [
                    np.remoteURL,
                    np.selectable,
                    np.showFooter,
                    np.showHeader,
                    np.additionalConditions,
                ]
            )) {
            if (!PRODUCTION) {
                console.log("[Table] Base props diference")
            }
            return true;
        }

        if (!PRODUCTION) {
            console.log("Table should update: false");
        }

        return should;
    }*/

    public componentWillReceiveProps(nextProps: ITableProps) {
        const columns = [...nextProps.columns];
        const preparedColumns: IColumnData[] = [];
        for (const i in columns) {
            preparedColumns[i] = this.prepareColumnData(columns[i]);
        }
        if (!deepIsEqual(preparedColumns, this.state.columns)) {
            this.setState({ columns: preparedColumns });
        }

        if (nextProps.data.data !== null && !deepIsEqual(nextProps.data, this.state.data)) {
            this.setState({ data: nextProps.data.data });
        }

        if (nextProps.filters) {
            const nextJSON = JSON.stringify(nextProps.filters);
            if (nextJSON != JSON.stringify(this.state.filters)) {
                this.setState(
                    {
                        filters: deepCopy(nextProps.filters),
                        currentPage: 1,
                    },
                    this.load,
                );
            }
        }
    }

    public getRequestData(): IDataQuery {
        const trimmedData = [...this.state.columns];

        for (let i = 0; i < trimmedData.length; i++) {
            trimmedData[i] = { ...trimmedData[i] };
            trimmedData[i].filter = null;
            trimmedData[i].events = null;
        }

        return {
            // need to deep clone and events remove
            columns: JSON.parse(JSON.stringify(trimmedData)),
            filters: this.state.filters,
            order: this.state.order,
            onPage: this.state.onPage,
            currentPage: this.state.currentPage,
            additionalConditions: this.props.additionalConditions,
        };
    }

    public load = () => {
        this.state.dataSourceError = "";

        if (this.props.onSelectionChange !== null) {
            this.props.onSelectionChange([]);
        }

        this.setState({ loading: true/*, data: []*/ });

        const setStateAfterLoad = (input: ITableDataInput, callback: () => any = null) => {
            if (!Array.isArray(input.data)) {
                this.setState({
                    dataSourceError: typeof input == "string" ? input : JSON.stringify(input),
                });
            } else {
                this.setState(
                    {
                        data: input.data.slice(0),
                        countAll: parseInt("" + input.countAll),
                        loading: false,
                        dataSourceDebug: input.debug ? input.debug : false,
                        firstLoaded: true,
                        selection: [],
                        allChecked: false,
                    },
                    callback,
                );
            }
            if (this.props.onDataChange) {
                this.props.onDataChange(input.data.slice(0), input.countAll);
            }
        };

        if (this.props.remoteURL) {
            if (this.xhrConnection) {
                this.xhrConnection.abort();
            }

            const comm = new Comm(this.props.remoteURL, "PUT");
            comm.on(CommEvents.SUCCESS, (data) => {
                setStateAfterLoad(data);
            });
            comm.setData(this.getRequestData());
            comm.on(CommEvents.FINISH, () => this.setState({ loading: false }));
            this.xhrConnection = comm.send();
        } else if (this.props.dataProvider) {
            const result = this.props.dataProvider(this.getRequestData());

            result.then((data) => {
                setStateAfterLoad(data, () => {
                    if (data.decorator != undefined) {
                        data.decorator(this.getRequestData(), deepCopy(data)).then(
                            (decoratorResult: ITableDataInput) => {
                                setStateAfterLoad(decoratorResult);
                            },
                        );
                    }
                    setStateAfterLoad(data);
                });
            });
        }
    };

    public handleStateRemove() {
        delete window.localStorage[this.hashCode];
        if (confirmDialog("Wyczyszczono dane tabelki, czy chcesz odświeżyć stronę?")) {
            window.location.reload();
        }
    }

    public handleFiltersDeleted() {
        this.setState({ filters: {} });
    }

    public handleFilterChanged = (filterValue: IFilterValue) => {
        this.state.filters[filterValue.field] = filterValue;
        this.setState({ currentPage: 1, filters: this.state.filters }, this.load);
        if (this.props.onFiltersChange) {
            this.props.onFiltersChange(deepCopy(this.state.filters));
        }
    };

    public handleFilterDelete = (key: string) => {
        delete this.state.filters[key];
        this.setState({ currentPage: 1, filters: this.state.filters }, this.load);
        if (this.props.onFiltersChange) {
            this.props.onFiltersChange(deepCopy(this.state.filters));
        }
    };

    public handleOrderDelete = (field: string) => {
        delete this.state.order[field];
        this.setState({}, this.load);
    };

    public headClicked = (index: number) => {
        const column = this.state.columns.filter((c) => c !== null && c.display === true)[index];

        if (!column.orderField) {
            return;
        }

        let field = null;

        const fieldName = column.orderField ? column.orderField : column.field;

        if (this.state.order[fieldName]) {
            field = this.state.order[fieldName];
        } else {
            field = {
                caption: column.caption,
                field: column.orderField,
                dir: "desc",
            };
        }

        field = { ...field, dir: field.dir == "asc" ? "desc" : "asc" };
        this.setState({ order: {...this.state.order, [fieldName]: field}}, this.load);
    };

    public handleOnPageChange = (onPage: number) => {
        this.setState({ onPage, currentPage: 1 }, this.load);
    };

    public handleCurrentPageChange = (page: number) => {
        const newPage = Math.max(1, Math.min(Math.ceil(this.state.countAll / this.state.onPage), page));
        if (newPage != this.state.currentPage) {
            this.setState({ currentPage: newPage, selection: [], allChecked: false }, () => this.load());
        }
    };

    public handleKeyDown = (e: React.KeyboardEvent) => {
        // right
        if (e.keyCode == 39) {
            this.handleCurrentPageChange(this.state.currentPage + 1);
        }

        // left
        if (e.keyCode == 37) {
            this.handleCurrentPageChange(this.state.currentPage - 1);
        }
    };

    public handleCheckClicked = (index: string | number) => {
        let s = this.state.selection;
        if (index == "all") {
            if (!this.state.allChecked) {
                this.state.data.forEach((el, itemIndex: number) => {
                    if (s.indexOf(itemIndex) == -1) {
                        s.push(itemIndex);
                    }
                });
            } else {
                s = [];
            }
            this.setState({ allChecked: !this.state.allChecked });
        } else {
            const selected = s.indexOf(index);
            if (selected == -1) {
                s.push(index);
            } else {
                s.splice(selected, 1);
            }

            if (s.length == this.state.data.length) {
                this.state.allChecked = true;
            } else {
                this.state.allChecked = false;
            }
        }

        if (this.props.onSelectionChange) {
            const tmp: any[] = [];
            s.forEach((indexSelection: any) => tmp.push(this.state.data[indexSelection]));
            this.props.onSelectionChange(tmp);
        }

        this.setState({ selection: s });
    };

    private prepareColumnData(inData: IColumnData | ColumnHelper): IColumnData {
        if (inData === null) {
            return null;
        }
        let column: IColumnData;

        // if (inData instanceof ColumnHelper) {
        // @ts-ignore
        if (typeof inData.get === "function") {
            column = (inData as ColumnHelper).get();
        } else {
            column = inData as IColumnData;
        }

        let data: IColumnData = {
            field: null,
            caption: column.caption === undefined ? column.field : column.caption,
            isSortable: true,
            display: true,
            toolTip: null,
            width: null,
            class: [],
            type: "Simple",
            orderField: null,
            icon: null,
            append: null,
            prepend: null,
            classTemplate: null,
            styleTemplate: null,
            template: null,
            rowSpan: null,
            default: "",
            header: {},
            events: {
                click: [],
                enter: [],
                leave: [],
                mouseUp: [],
            },
            filter: [
                {
                    component: TextFilter,
                    field: column.field,
                    caption: column.field,
                },
            ],
        };

        data = { ...data, ...column };

        data.orderField = data.orderField || data.field;
        data.filter.forEach((el) => (el.field = el.field || column.field));

        return data;
    }

    public render() {
        const columns = deepCopy(this.state.columns);


        return (
            <div
                className={"w-table  " + (this.state.loading ? "w-table-loading" : "")}
                tabIndex={0}
                onKeyDown={this.handleKeyDown}
            >
                <div className="w-table-loader">
                    <LoadingIndicator/>
                </div>
                <div className="w-table-top">
                    <FiltersPresenter
                        order={this.state.order}
                        filters={this.state.filters}
                        FilterDelete={this.handleFilterDelete}
                        orderDelete={this.handleOrderDelete}
                    />
                </div>

                <table ref={(el) => (this.tableRef = el)}>
                    {this.props.showHeader && (
                        <Thead
                            selectable={this.props.selectable}
                            columns={columns}
                            order={deepCopy(this.state.order)}
                            filters={deepCopy(this.state.filters)}
                            onFilterChanged={this.handleFilterChanged}
                            onCellClicked={this.headClicked}
                            onCheckAllClicked={() => this.handleCheckClicked("all")}
                            allChecked={this.state.allChecked}
                        />
                    )}
                    <tbody className={this.props.infoRow !== null ? "tbody-with-info-row" : "tbody-without-info-row"}>
                    {this.state.dataSourceError != "" && (
                        <Error colspan={columns.length + 1} error={this.state.dataSourceError}/>
                    )}
                    {!this.state.loading && this.state.data.length == 0 && (
                        <EmptyResult colspan={columns.length + 1}/>
                    )}
                    {this.state.loading && !this.state.firstLoaded && <Loading colspan={columns.length + 1}/>}
                    {/*TODO sprawdzić dlaczego first loaded jest potrzebne*/}
                    {/*this.state.firstLoaded && */}
                    {this.state.data.length > 0 && (
                        <Tbody
                            rowClassTemplate={this.props.rowClassTemplate}
                            rowStyleTemplate={this.props.rowStyleTemplate}
                            selection={deepCopy(this.state.selection)}
                            onCheck={this.handleCheckClicked}
                            selectable={this.props.selectable}
                            columns={columns}
                            filters={this.state.filters}
                            order={this.state.order}
                            loading={this.state.loading}
                            data={this.state.data}
                            infoRow={this.props.infoRow}
                            groupBy={this.props.groupBy}
                            columnWidths={this.columnWidths}
                        />
                    )}
                    </tbody>

                    {this.props.showFooter && (
                        <tfoot>
                        {this.state.firstLoaded && (
                            <Footer
                                columns={columns}
                                count={this.state.countAll}
                                onPage={this.state.onPage}
                                onPageChanged={this.handleOnPageChange}
                                currentPage={this.state.currentPage}
                                currentPageChanged={this.handleCurrentPageChange}
                                reload={this.load}
                            />
                        )}
                        </tfoot>
                    )}
                </table>

                {this.state.dataSourceDebug ? <pre>{this.state.dataSourceDebug}</pre> : null}
            </div>
        );
    }
}
