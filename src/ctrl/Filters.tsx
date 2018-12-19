import * as React from "react";
import * as ReactDOM from "react-dom";
import {IFilter, IFilterValue} from "./filters/Intefaces";
import {BConnectionsField} from "../layout/BootstrapForm";
import {Switch} from "./Fields";
import {Icon} from "./Icon";
import {LoadingIndicator} from "./LoadingIndicator";

let locale;
let datePicker;

interface IFilterProps {
    field: string;
    caption: string;
    /** Filters container for keep focus etc */
    container?: any;
    onChange?: (filterValue: IFilterValue) => any;
    onApply?: (filterValue: IFilterValue) => any;
    config?: any;
    showApply?: boolean;
}

export interface IFilterComponent {
    // todo
    // FILTER_INTERFACE_TEST?: boolean

}

class AbstractFilter extends React.Component<IFilterProps, any> {
    public static defaultProps: Partial<IFilterProps> = {
        config: {},
    };
}

class DateFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean = true;
    public timepicker: any;
    public datepicker: any;
    public choiceTypes = {"<x<in": "range", ">": "exists", "IN": "not-exists"};

    constructor(props) {
        super(props);

        this.state = {
            startDate: null,
            endDate: null,
            startTime: null,
            endTime: null,
            libsLoaded: false,
            choiceType: props.value ? this.choiceTypes[props.value.condition] : "range",  // exists, not-exists
        };

        this.datepicker = null;
        this.timepicker = null;
    }

    public componentWillMount() {

        Promise.all([
            import("moment"),
            import("moment/locale/pl"),
            import("react-dates"),
            import("react-dates/lib/css/_datepicker.css"),

        ]).then(([ moment, locale, datePickerImp]) => {
            moment = moment.default;
            datePicker = datePickerImp.default;

            this.setState({
                startDate: moment(),
                endDate: moment(),
                startTime: moment().startOf("day"),
                endTime: moment().endOf("day"),
                libsLoaded: true,
            });
        });

    }

    public componentWillReceiveProps(nextProps) {
        this.setState({
            choiceType: nextProps.value ? this.choiceTypes[nextProps.value.condition] : "range",
        });
    }

    public getValue() {
        const dateStart = this.state.startDate.format("YYYY-MM-DD");
        const timeStart = this.state.startTime.format("HH:mm:ss");
        const dateStop = this.state.endDate.format("YYYY-MM-DD");
        const timeStop = this.state.endTime.format("HH:mm:ss");

        const separatorI = '<i class="fa fa-arrow-right"></i>';
        const calendarI = ""; // '<i class="fa fa-calendar-o"></i>';
        const clockI = '<i class="fa fa-clock-o"></i>';

        const val = `${dateStart} ${timeStart} : ${dateStop} ${timeStop}`;
        let label = `${calendarI} ${dateStart} ${clockI} ${timeStart} ${separatorI} ${calendarI} ${dateStop} ${clockI} ${timeStop}`;
        if (timeStart == "00:00:00" && timeStop == "23:59:59") {
            label = `${dateStart} ${separatorI} ${dateStop}`;
        }

        let applyVal: string | string[] = "";
        let condition: string;

        if (this.state.choiceType == "range") {
            condition = "<x<in";
            applyVal = val;
        } else if (this.state.choiceType == "exists") {
            condition = ">";
            applyVal = "0000-00-00 00:00:00";
            label = __("Data ustalona");
        } else if (this.state.choiceType == "not-exists") {
            condition = "IN";
            applyVal = ["0000-00-00 00:00:00", null, ""];
            label = __("Data nie ustalona");
        }

        return {
            field: this.props.field,
            value: applyVal,
            condition,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label,
        };

    }

    public handleChange() {
        if (this.state.startDate && this.state.endDate && this.props.onChange) {
            this.props.onChange(this.getValue());
        }
    }

    public handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    }

    public render() {

        if (this.state.libsLoaded == false) {
            return <div className={"w-filter w-filter-date"}>
                <LoadingIndicator/>
            </div>;
        }

        const s = this.state;
        return (
            <div className={"w-filter w-filter-date"}>

                <div style={{display: (s.choiceType != "range" ? "none" : "block")}}>

                    <datePicker.DateRangePicker
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onDatesChange={({startDate, endDate}) => {
                            this.setState({startDate, endDate}, () => {
                                if (startDate && endDate) {
                                    this.handleChange();
                                }
                            });
                        }}
                        focusedInput={this.state.focusedInput}
                        onFocusChange={(focusedInput) => {
                            if (focusedInput == null && this.props.container) {
                                this.props.container.focus();
                            }
                            this.setState({focusedInput});
                        }}
                        startDatePlaceholderText="Data od"
                        endDatePlaceholderText="Data do"
                        minimumNights={0}
                        isOutsideRange={() => {
                            return false;
                        }}
                        onPrevMonthClick={(e) => {
                            if (this.props.container) {
                                this.props.container.focus();

                                setTimeout(() => {
                                    this.props.container.focus();
                                }, 250);
                            }
                        }}
                        onNextMonthClick={() => {
                            if (this.props.container) {
                                this.props.container.focus();
                                setTimeout(() => {
                                    this.props.container.focus();
                                }, 250);
                            }
                        }}
                        renderCalendarInfo={() => false}
                    />
                </div>
                <div className="w-filter-date-exists">
                    <div>
                        <label>
                            <input checked={s.choiceType == "range"} onChange={(e) => this.setState({choiceType: "range"}, this.handleChange)} type="checkbox"/> <Icon name={"ScrollUpDown"}/> Według wybou
                        </label>
                    </div>
                    <div>
                        <label>
                            <input checked={s.choiceType == "exists"} onChange={(e) => this.setState({choiceType: "exists"}, this.handleChange)} type="checkbox"/> <Icon name={"CheckMark"}/> Data ustalona
                        </label>
                    </div>

                    <div>
                        <label>
                            <input checked={s.choiceType == "not-exists"} onChange={(e) => this.setState({choiceType: "not-exists"}, this.handleChange)} type="checkbox"/> <Icon name={"Clear"}/> Brak daty
                        </label>
                    </div>
                </div>

                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
            </div>

        );
    }

}

class SelectFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean;
    public select: any;

    constructor(props) {
        super(props);
        let value: any = "";
        if (props.value) {
            value = props.value;
        }
        if (props.config.multiselect && value == "") {
            value = [];
        }

        this.state = {
            value,
        };
    }

    public componentWillReceiveProps(nextProps) {

        let value: any = "";
        if (nextProps.value) {
            value = nextProps.value.value;
        } else {
            value = this.props.config._default;
        }
        if (this.props.config.multiselect && value == "") {
            value = [];
        }

        this.setState(  {
            value,
        });

    }

    public static defaultProps: Partial<IFilterProps> = {
        config: {multiselect: false, content: []},
    };

    public getValue() {
        const select = ReactDOM.findDOMNode(this.select);

        let values = [].filter.call(select.options, function(o) {
            return o.selected;
        }).map(function(o) {
            return o.value;
        });
        const labels = [].filter.call(select.options, function(o) {
            return o.selected;
        }).map(function(o) {
            return o.innerHTML;
        });

        values = this.props.config.multiselect ? values : values[0];
        const condition = this.props.config.multiselect ? "IN" : "==";
        return {
            field: this.props.field,
            value: values,
            condition,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: labels.join(", "),
        };
    }

    public handleChange(e) {

        this.setState({
            value: this.getValue().value,
        });

        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }

    }

    public handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    }

    public render() {
        const {config} = this.props;
        let content;
        if (!Array.isArray(this.props.config.content)) {
            content = Object.entries(this.props.config.content).map(([value, label]) => ({value, label}));
        } else {
            content = this.props.config.content;
        }

        return (

            <div className={"w-filter w-filter-select"}>
                <select
                    autoFocus={config.disableAutoFocus === true ? false : true}
                    ref={(el) => this.select = el}
                    multiple={this.props.config.multiselect}
                    size={this.props.config.multiselect ? Object.keys(this.props.config.content).length : 1}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.value}
                >
                    {this.props.config.multiselect ? "" :
                        <option key={"-1default"} value="">{__("Wybierz opcję")}</option>
                    }
                    {content.map((el) =>
                        <option
                            key={el.value}
                            value={el.value}

                            onMouseDown={(e) => {

                                if (this.props.config.multiselect) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    e.currentTarget.selected = e.currentTarget.selected ? false : true;
                                    return false;
                                }
                            }}
                        >{el.label} </option>,
                    )}
                </select>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props.content, null, 2)} {Object.keys(this.props.content).length}</pre>*/}
            </div>

        );
    }

}

class SwitchFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean;

    constructor(props) {
        super(props);
        this.state = {value: props.value ? props.value.value : null};
    }

    public componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value ? nextProps.value.value : null,
        });
    }

    public getValue() {
        return {
            field: this.props.field,
            value: this.state.value,
            condition: "==",
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: this.props.config.content.filter((el) => el.value == this.state.value)[0].label,
        };
    }

    public handleChange() {
        this.setState({show: false});
        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }
    }

    public handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    }

    public render() {

        return (

            <div className="w-filter w-filter-switch" ref="body">
                <Switch options={this.props.config.content} value={this.state.value} onChange={(e) => this.setState({value: e.value}, this.handleChange)}/>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props, null, 2)}</pre>*/}
            </div>

        );
    }

}

class NumericFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean;
    public input2: HTMLInputElement;
    public input1: HTMLInputElement;
    public input3: HTMLTextAreaElement;

    constructor(props) {
        super(props);
        this.state = {option: "LIKE"};
    }

    public getValue() {
        let val, label;
        if (this.state.option != "IN") {
            val = this.input1.value;
            if (this.state.option == "<x<") {
                val += "-" + this.input2.value;
            }
            label = val;
        } else {
            val = this.input3.value.split("\n");
            label = val.join(", ");
            if (label.length > 50) {
                label = label.substring(0, 50) + "....";
            }

        }

        return {
            field: this.props.field,
            value: val,
            condition: this.state.option,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label,
        };
    }

    public handleApply() {
        this.setState({show: false});

        if (this.props.onApply) {
            console.log(this.getValue());
            this.props.onApply(this.getValue());
        }

        if (this.props.onChange) {

            this.props.onChange(this.getValue());
        }

    }

    public _handleKeyPress(e) {
        if (e.key === "Enter") {
            this.handleApply();
        }
    }

    public render() {
        const options = {
            "LIKE": __("zawiera"),
            "==": __("równa"),
            "<": __("mniejsza"),
            "<=": __("mniejsza równa"),
            ">": __("większa"),
            ">=": __("większa równia"),
            "<x<": __("pomiędzy"),
            "IN": __("wiele wartości ( rozdziel enterem )"),
        };

        const {config} = this.props;

        return (
            <div className={"w-filter w-filter-numeric"} ref="body">

                {this.state.option == "<x<" ?
                    <div className="w-filter-label">Od</div>
                    : ""}

                {this.state.option != "IN" ?
                    <input type="text" autoFocus={config.disableAutoFocus === true ? false : true} ref={(el) => this.input1 = el} onKeyPress={this._handleKeyPress.bind(this)}/>
                    :
                    <textarea autoFocus={config.disableAutoFocus === true ? false : true} ref={(el) => this.input3 = el}/>
                }

                {this.state.option == "<x<" ?
                    <div className="w-filter-label">Do
                        <input type="text" ref={(el) => this.input2 = el} onKeyPress={this._handleKeyPress.bind(this)}/></div>
                    : ""}
                <select name="" id=""
                        onChange={(e) => this.setState({option: e.currentTarget.value})}
                        value={this.state.option}
                >
                    {Object.entries(options).map(([key, val]) =>
                        <option value={key} key={key}> {val}</option>,
                    )}
                </select>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props, null, 2)}</pre>*/}
            </div>
        );
    }

}

class ConnectionFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean;

    constructor(props) {
        super(props);
        this.state = {
            searchValue: null,
            searchLabel: null,
        };
    }

    public getValue() {
        return {
            field: this.props.field,
            value: this.state.searchValue,
            condition: "=",
            caption: this.props.caption,
            labelCaptionSeparator: " :",
            label: this.state.searchLabel,
        };
    }

    public handleChange(event) {
        this.setState({
            searchValue: event.value,
            searchLabel: event.items.length > 0 ? event.items[0].label : null,
        }, () => {
            if (this.props.onChange != null) {
                this.props.onChange(this.getValue());
            }
        });
    }

    public handleApply() {
        this.setState({show: false});
        if (this.state.searchValue && this.props.onApply) {
            this.props.onApply(this.getValue());
        }

    }

    public _handleKeyPress(e) {
        if (e.key === "Enter") {
            this.handleApply();
        }
    }

    public render() {
        return (

            <div className={"w-filter w-filter-text "} ref="body">

                <BConnectionsField
                    {...this.props.config}
                    editable={true}
                    items={[]}
                    onChange={this.handleChange.bind(this)}
                />

                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
            </div>

        );
    }

}

class TextFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean;
    public input: HTMLInputElement;
    public options: any;
    public timeout: number = null;

    constructor(props) {
        super(props);

        this.state = {
            option: props.value ? props.value.condition : "LIKE",
            searchText: props.value ? props.value.value : "",
        };
        this.options = {
            "LIKE": __("zawiera"),
            "==": __("równy"),
            "!=": __("różne"),
            "NOT LIKE": __("nie zawiera"),
            "^%": __("zaczyna się od"),
            "%$": __("kończy się na"),
        };

    }

    public componentWillReceiveProps(nextProps) {
        this.setState({
            option: nextProps.value ? nextProps.value.condition : "LIKE",
            searchText: nextProps.value ? nextProps.value.value : "",
        });
    }

    public getValue() {
        return {
            field: this.props.field,
            value: this.state.searchText,
            condition: this.state.option,
            caption: this.props.caption,
            labelCaptionSeparator: this.options[this.state.option] + " :",
            label: this.state.searchText,
        };
    }

    public handleChange() {
        clearTimeout(this.timeout);
        /*this.timeout = setTimeout(() => {
            if (this.props.onChange) {
                this.props.onChange(this.getValue());
            }
        }, 400);*/
    }

    public handleApply() {
        this.setState({show: false});
        if (this.state.searchText && this.props.onApply) {
            this.props.onApply(this.getValue());
        }
        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }
    }

    public handleInputChange = (e) => {

        this.setState(
            {searchText: e.target.value},
            this.handleChange,
        );

    }

    public handleSelectChange(e) {
        this.setState(
            {option: e.target.value},
            this.handleChange,
        );
    }

    public handleKeyPress = (e) => {
        if (e.key === "Enter") {
            this.handleApply();
        }
    }

    public render() {

        const {config} = this.props;

        return (

            <div className={"w-filter w-filter-text "} ref="body">

                <input type="text" value={this.state.searchText} onChange={this.handleInputChange} autoFocus={config.disableAutoFocus === true ? false : true} onKeyPress={this.handleKeyPress}/>

                {this.props.config.extendedInfo && <select
                    onChange={this.handleSelectChange.bind(this)}
                    value={this.state.option}

                >
                    {Object.entries(this.options).map(([key, val]) =>
                        <option value={key} key={key}> {val}</option>,
                    )}
                </select>}

                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
            </div>

        );
    }

}

export {
    DateFilter,
    SelectFilter,
    SwitchFilter,
    NumericFilter,
    TextFilter,
    AbstractFilter,

    ConnectionFilter,
};
