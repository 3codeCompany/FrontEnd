import * as React from "react";
import * as ReactDOM from 'react-dom';
import {IFilter, IFilterValue} from "./filters/Intefaces";

import 'react-dates/lib/css/_datepicker.css'
import {BConnectionsField} from "../layout/BootstrapForm";
import {Switch} from "./Fields";
import {Icon} from "./Icon";

let moment;
let locale;
let datePicker;

interface IFilterProps {
    field: string
    caption: string
    /**Filters container for keep focus etc */
    container?: any
    onChange?: { (filterValue: IFilterValue): any }
    onApply?: { (filterValue: IFilterValue): any }
    config?: any
    showApply?: boolean
}

interface IFilterComponent {
    //todo
    //FILTER_INTERFACE_TEST?: boolean

}

class AbstractFilter extends React.Component<IFilterProps, any> {

}


class DateFilter extends AbstractFilter implements IFilterComponent {
    public FILTER_INTERFACE_TEST: boolean = true;
    timepicker: any;
    datepicker: any;
    choiceTypes = {'<x<in': "range", ">": 'exists', "IN": "not-exists"};


    constructor(props) {
        super(props)

        this.state = {
            startDate: null,
            endDate: null,
            startTime: null,
            endTime: null,
            libsLoaded: false,
            choiceType: props.value ? this.choiceTypes[props.value.condition] : 'range'  // exists, not-exists
        }

        this.datepicker = null;
        this.timepicker = null;
    }

    componentWillMount() {

        Promise.all([
            import('moment'),
            import('moment/locale/pl'),
            import('react-dates'),

        ]).then(imported => {
            [moment, locale, datePicker/*, timePicker*/] = imported;
            this.setState({
                startDate: moment(),
                endDate: moment(),
                startTime: moment().startOf('day'),
                endTime: moment().endOf('day'),
                libsLoaded: true
            });
        });


    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            choiceType: nextProps.value ? this.choiceTypes[nextProps.value.condition] : 'range'
        })
    }


    getValue() {
        let dateStart = this.state.startDate.format('YYYY-MM-DD');
        let timeStart = this.state.startTime.format('HH:mm:ss');
        let dateStop = this.state.endDate.format('YYYY-MM-DD');
        let timeStop = this.state.endTime.format('HH:mm:ss');

        let separatorI = '<i class="fa fa-arrow-right"></i>';
        let calendarI = ''; //'<i class="fa fa-calendar-o"></i>';
        let clockI = '<i class="fa fa-clock-o"></i>';

        let val = `${dateStart} ${timeStart} : ${dateStop} ${timeStop}`;
        let label = `${calendarI} ${dateStart} ${clockI} ${timeStart} ${separatorI} ${calendarI} ${dateStop} ${clockI} ${timeStop}`;
        if (timeStart == '00:00:00' && timeStop == '23:59:59')
            label = `${dateStart} ${separatorI} ${dateStop}`;

        let applyVal: string | Array<string> = "";
        let condition: string;


        if (this.state.choiceType == 'range') {
            condition = "<x<in";
            applyVal = val;
        } else if (this.state.choiceType == 'exists') {
            condition = ">";
            applyVal = '0000-00-00 00:00:00';
            label = 'Data ustalona';
        } else if (this.state.choiceType == 'not-exists') {
            condition = "IN";
            applyVal = ['0000-00-00 00:00:00', null, ''];
            label = "Data nie ustalona";
        }

        return {
            field: this.props.field,
            value: applyVal,
            condition: condition,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: label
        };

    }

    handleChange() {
        if (this.state.startDate && this.state.endDate && this.props.onChange) {
            this.props.onChange(this.getValue())
        }
    }

    handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue())
        }
    }

    render() {

        if (this.state.libsLoaded == false) {
            return <div className={'w-filter w-filter-date'}>
                <div><i className="fa fa-cog fa-spin"></i></div>
            </div>
        }


        let s = this.state;
        return (
            <div className={'w-filter w-filter-date'}>

                <div style={{display: (s.choiceType != 'range' ? 'none' : 'block')}}>

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
                        onFocusChange={focusedInput => {
                            if (focusedInput == null && this.props.container) {
                                this.props.container.focus()
                            }
                            this.setState({focusedInput});
                        }}
                        startDatePlaceholderText="Data od"
                        endDatePlaceholderText="Data do"
                        minimumNights={0}
                        isOutsideRange={() => {
                            return false
                        }}
                        onPrevMonthClick={(e) => {
                            if (this.props.container) {
                                this.props.container.focus();

                                setTimeout(() => {
                                    this.props.container.focus();
                                }, 250)
                            }
                        }}
                        onNextMonthClick={() => {
                            if (this.props.container) {
                                this.props.container.focus();
                                setTimeout(() => {
                                    this.props.container.focus();
                                }, 250)
                            }
                        }}
                        renderCalendarInfo={() => false}
                    />
                </div>
                <div className="w-filter-date-exists">
                    <div>
                        <label>
                            <input checked={s.choiceType == 'range'} onChange={e => this.setState({choiceType: 'range'}, this.handleChange)} type="checkbox"/> <Icon name={"ScrollUpDown"}/> Według wybou
                        </label>
                    </div>
                    <div>
                        <label>
                            <input checked={s.choiceType == 'exists'} onChange={e => this.setState({choiceType: 'exists'}, this.handleChange)} type="checkbox"/> <Icon name={"CheckMark"}/> Data ustalona
                        </label>
                    </div>

                    <div>
                        <label>
                            <input checked={s.choiceType == 'not-exists'} onChange={e => this.setState({choiceType: 'not-exists'}, this.handleChange)} type="checkbox"/> <Icon name={"Clear"}/> Brak daty
                        </label>
                    </div>
                </div>


                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
            </div>


        )
    }

}

class SelectFilter extends AbstractFilter implements IFilterComponent {
    FILTER_INTERFACE_TEST: boolean;
    select: any;

    constructor(props) {
        super(props);
        this.state = {value: props.value ? props.value.value : ""};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value ? nextProps.value.value : this.props.config._default
        })
    }


    public static defaultProps: Partial<IFilterProps> = {
        config: {multiselect: false, content: []}
    };


    getValue() {
        let select = ReactDOM.findDOMNode(this.select);

        let values = [].filter.call(select.options, function (o) {
            return o.selected;
        }).map(function (o) {
            return o.value;
        });
        let labels = [].filter.call(select.options, function (o) {
            return o.selected;
        }).map(function (o) {
            return o.innerHTML;
        });

        values = this.props.config.multiselect ? values : values[0];
        let condition = this.props.config.multiselect ? "IN" : "==";
        return {
            field: this.props.field,
            value: values,
            condition: condition,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: labels.join(', ')
        }
    }

    handleChange(e) {
        this.setState({
            value: e.target.value
        })
        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }

    }

    handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    }

    render() {
        let content;
        if (!Array.isArray(this.props.config.content)) {
            content = Object.entries(this.props.config.content).map(([value, label]) => ({value, label}))
        } else {
            content = this.props.config.content;
        }

        return (

            <div className={'w-filter w-filter-select'}>
                <select
                    autoFocus
                    ref={el => this.select = el}
                    multiple={this.props.config.multiselect}
                    size={this.props.config.multiselect ? Object.keys(this.props.config.content).length : 1}
                    onChange={this.handleChange.bind(this)}
                    value={this.state.value}
                >
                    {this.props.config.multiselect ? '' :
                        <option key={"-1default"} value="">Wybierz opcję</option>
                    }
                    {content.map((el) =>
                        <option
                            key={el.value}
                            value={el.value}

                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                e.currentTarget.selected = e.currentTarget.selected ? false : true;
                                return false;
                            }}
                        >{el.label} </option>
                    )}
                </select>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props.content, null, 2)} {Object.keys(this.props.content).length}</pre>*/}
            </div>

        )
    }

}


class SwitchFilter extends AbstractFilter implements IFilterComponent {
    FILTER_INTERFACE_TEST: boolean;


    constructor(props) {
        super(props);
        this.state = {value: props.value ? props.value.value : null};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value ? nextProps.value.value : null
        })
    }

    getValue() {
        return {
            field: this.props.field,
            value: this.state.value,
            condition: '==',
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: this.props.config.content.filter(el => el.value == this.state.value)[0].label
        }
    }

    handleChange() {
        this.setState({show: false});
        if (this.props.onChange) {
            this.props.onChange(this.getValue())
        }
    }

    handleApply() {
        this.setState({show: false});
        if (this.props.onApply) {
            this.props.onApply(this.getValue())
        }
    }

    render() {

        return (

            <div className="w-filter w-filter-switch" ref="body">
                <Switch options={this.props.config.content} value={this.state.value} onChange={(e) => this.setState({value: e.value}, this.handleChange)}/>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props, null, 2)}</pre>*/}
            </div>

        )
    }

}

class NumericFilter extends AbstractFilter implements IFilterComponent {
    FILTER_INTERFACE_TEST: boolean;
    input2: HTMLInputElement;
    input1: HTMLInputElement;
    input3: HTMLTextAreaElement;

    constructor(props) {
        super(props)
        this.state = {option: 'LIKE'};
    }


    getValue() {
        let val, label;
        if (this.state.option != 'IN') {
            val = this.input1.value;
            if (this.state.option == '<x<') {
                val += '-' + this.input2.value
            }
            label = val;
        } else {
            val = this.input3.value.split('\n');
            label = val.join(', ')
            if (label.length > 50) {
                label = label.substring(0, 50) + '....';
            }

        }

        return {
            field: this.props.field,
            value: val,
            condition: this.state.option,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: label
        };
    }

    handleApply() {
        this.setState({show: false});


        if (this.props.onApply) {
            console.log(this.getValue());
            this.props.onApply(this.getValue());
        }

        if (this.props.onChange) {

            this.props.onChange(this.getValue());
        }

    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleApply();
        }
    }

    render() {
        const options = {
            'LIKE': 'zawiera',
            '==': 'równa',
            '<': 'mniejsza',
            '<=': 'mniejsza równa',
            '>': 'większa',
            '>=': 'większa równia',
            '<x<': 'pomiędzy',
            'IN': 'wiele wartości ( rozdziel enterem )',
        };
        return (
            <div className={'w-filter w-filter-numeric'} ref="body">
                {this.state.option == '<x<' ?
                    <div className="w-filter-label">Od</div>
                    : ''}

                {this.state.option != 'IN' ?
                    <input type="text" autoFocus ref={el => this.input1 = el} onKeyPress={this._handleKeyPress.bind(this)}/>
                    :
                    <textarea autoFocus ref={el => this.input3 = el}/>
                }

                {this.state.option == '<x<' ?
                    <div className="w-filter-label">Do
                        <input type="text" ref={el => this.input2 = el} onKeyPress={this._handleKeyPress.bind(this)}/></div>
                    : ''}
                <select name="" id=""
                        onChange={(e) => this.setState({option: e.currentTarget.value})}
                        value={this.state.option}
                >
                    {Object.entries(options).map(([key, val]) =>
                        <option value={key} key={key}> {val}</option>
                    )}
                </select>
                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
                {/*<pre>{JSON.stringify(this.props, null, 2)}</pre>*/}
            </div>
        )
    }

}

class ConnectionFilter extends AbstractFilter implements IFilterComponent {
    FILTER_INTERFACE_TEST: boolean;

    constructor(props) {
        super(props)
        this.state = {
            searchValue: null,
            searchLabel: null,
        }
    }


    getValue() {
        return {
            field: this.props.field,
            value: this.state.searchValue,
            condition: "=",
            caption: this.props.caption,
            labelCaptionSeparator: ' :',
            label: this.state.searchLabel
        }
    }

    handleChange(event) {
        this.setState({
            searchValue: event.value,
            searchLabel: event.items.length > 0 ? event.items[0].label : null,
        }, () => {
            if (this.props.onChange != null) {
                this.props.onChange(this.getValue());
            }
        });
    }

    handleApply() {
        this.setState({show: false});
        if (this.state.searchValue && this.props.onApply) {
            this.props.onApply(this.getValue())
        }

    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleApply();
        }
    }


    render() {
        return (

            <div className={'w-filter w-filter-text '} ref="body">


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

        )
    }

}

class TextFilter extends AbstractFilter implements IFilterComponent {
    FILTER_INTERFACE_TEST: boolean;
    input: HTMLInputElement;
    options: any;
    timeout: number = null;

    constructor(props) {
        super(props)

        this.state = {
            option: props.value ? props.value.condition : 'LIKE',
            searchText: props.value ? props.value.value : '',
        }
        this.options = {
            'LIKE': 'zawiera',
            '==': 'r\u00f3wny',
            '!=': 'r\u00f3\u017cne',
            'NOT LIKE': 'nie zawiera',
            '^%': 'zaczyna si\u0119 od',
            '%$': 'ko\u0144czy si\u0119 na'
        };

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            option: nextProps.value ? nextProps.value.condition : 'LIKE',
            searchText: nextProps.value ? nextProps.value.value : '',
        })
    }

    getValue() {
        return {
            field: this.props.field,
            value: this.state.searchText,
            condition: this.state.option,
            caption: this.props.caption,
            labelCaptionSeparator: this.options[this.state.option] + ' :',
            label: this.state.searchText
        };
    }

    handleChange() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (this.props.onChange) {
                this.props.onChange(this.getValue());
            }
        }, 400)
    }

    handleApply() {
        this.setState({show: false});
        if (this.state.searchText && this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    }

    handleInputChange(e) {
        this.setState(
            {searchText: e.target.value},
            this.handleChange
        );

    }

    handleSelectChange(e) {
        this.setState(
            {option: e.target.value},
            this.handleChange
        );
    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            this.handleApply();
        }
    }

    render() {

        return (

            <div className={'w-filter w-filter-text '} ref="body">

                <input type="text" value={this.state.searchText} onChange={this.handleInputChange.bind(this)} autoFocus onKeyPress={this._handleKeyPress.bind(this)}/>

                <select
                    onChange={this.handleSelectChange.bind(this)}
                    value={this.state.option}

                >
                    {Object.entries(this.options).map(([key, val]) =>
                        <option value={key} key={key}> {val}</option>
                    )}
                </select>

                {this.props.showApply && <div>
                    <button className="w-filter-apply" onClick={this.handleApply.bind(this)}>Zastosuj</button>
                </div>}
            </div>

        )
    }

}


export {
    DateFilter,
    SelectFilter,
    SwitchFilter,
    NumericFilter,
    TextFilter,
    AbstractFilter,
    IFilterComponent,
    ConnectionFilter
};
