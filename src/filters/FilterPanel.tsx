import * as React from "react";
import { IFilterValue } from "../filters";
import { IFilter } from "../filters/Intefaces";
import { FilterHelper } from "../filters/FilterHelper";

import "./FilterPanel.sass";

interface IFilterPanelProps {
    items: any[];
    filters: any;
    onChange?: (filter: IFilterValue, filters: { [key: string]: IFilterValue }) => any;
    onApply?: (filters: { [key: string]: IFilterValue }) => any;
}

interface IFilterPanelState {
    value: { [key: string]: IFilterValue };
}

export class FilterPanel extends React.Component<IFilterPanelProps, IFilterPanelState> {
    constructor(props: IFilterPanelProps) {
        super(props);
        this.state = {
            value: {},
        };
    }

    public handleApply = () => {
        if (this.props.onApply) {
            this.props.onApply(this.state.value);
        }
    };

    public UNSAFE_componentWillReceiveProps(nextProps: IFilterPanelProps) {
        this.setState({ value: nextProps.filters });
    }

    public handleChange = (filter: IFilter, val: IFilterValue) => {
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
    };

    public render() {
        let filters: IFilter[];
        filters = this.props.items.map((el: IFilter | FilterHelper) => (el instanceof FilterHelper ? el.get() : el));

        return (
            <div className="w-filters-panel">
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

                    return (
                        <div key={filter.field} className="filter-element">
                            <Component {...filter} />
                        </div>
                    );
                })}
                {this.props.onApply != undefined && (
                    <a className="btn btn-primary" onClick={this.handleApply}>
                        Zastosuj
                    </a>
                )}
                {/*
            <a className="btn ">Wyczyść filtry</a>*/}
            </div>
        );
    }
}
