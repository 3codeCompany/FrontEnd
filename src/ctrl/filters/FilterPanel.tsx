import * as React from "react";
import {IFilterValue} from "../table/Interfaces";
import {IFilter} from "../filters/Intefaces";
import {FilterHelper} from "../filters/FilterHelper";

interface IFilterPanelProps {
    items: any[];
    filters: any;
    onChange?: (filter: IFilterValue, filters: { [key: string]: IFilterValue }) => any;
    onApply?: (filters: IFilterValue[]) => any;
}

interface IFilterPanelState {
    value: { [key: string]: IFilterValue };
}

export class FilterPanel extends React.Component<IFilterPanelProps, IFilterPanelState> {

    constructor(props) {
        super(props);
        this.state = {
            value: {},
        };
    }

    public handleApply() {

    }

    public componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.filters});
    }

    public handleChange(filter: IFilter, val: IFilterValue) {
        if (val.value) {
            this.state.value[val.field] = val;
        } else {
            delete this.state.value[val.field];
        }


        this.setState({
            value: this.state.value,
        });

        if (this.props.onChange) {
            this.props.onChange(val, this.state.value);
        }

    }

    public render() {
        let filters: IFilter[];
        filters = this.props.items.map((el: IFilter | FilterHelper) => (el instanceof FilterHelper) ? el.get() : el);

        return <div className="w-filters-panel">

            {filters.map((filter, index) => {
                const Component = filter.component;
                filter.onChange = (val: IFilterValue) => {
                    this.handleChange(filter, val);
                };

                filter.value = this.state.value[filter.field];

                if (filter.config !== undefined) {
                    filter.config.disableAutoFocus = index > 0;
                } else {
                    filter.config = { disableAutoFocus: index > 0 };
                }

                return <div key={filter.field} className="filter-element">
                    <div className="filter-caption">  {filter.caption}</div>
                    <Component {...filter}  />
                </div>;
            })}
            {/*<a className="btn btn-primary" onClick={this.handleApply.bind(this)}>Zastosuj</a>
            <a className="btn ">Wyczyść filtry</a>*/}
        </div>;
    }
}
