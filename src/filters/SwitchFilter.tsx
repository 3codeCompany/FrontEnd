import * as React from "react";

import { fI18n } from "../lib/I18n";
import AbstractFilter, { IFilterProps } from "./AbstractFilter";

import "./SwitchFilter.sass";
import { IOption, Switch } from "../fields";
import { ISelectFilterProps } from "./SelectFilter";

interface ISwitchFilterProps extends IFilterProps {
    config: {
        content: IOption[];
        disableAutoFocus?: boolean;
    };
}

export default class SwitchFilter extends AbstractFilter<ISwitchFilterProps> {
    public static defaultProps: Partial<ISelectFilterProps> = {
        config: {
            content: [],
            disableAutoFocus: true,
        },
    };

    constructor(props: ISwitchFilterProps) {
        super(props);
        this.state = { value: props.value ? props.value.value : null };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: ISwitchFilterProps) {
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
            label: this.props.config.content.filter((el) => el.value == this.state.value)[0].label as string,
        };
    }

    public handleChange = () => {
        this.setState({ show: false });
        if (this.props.onChange) {
            this.props.onChange(this.getValue());
        }
    };

    public handleApply = () => {
        this.setState({ show: false });
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    };

    public render() {
        const { caption } = this.props;
        return (
            <div className="w-filter w-filter-switch">
                {caption != "" && <div className={"w-filter-title"}>{caption}</div>}
                <Switch
                    options={this.props.config.content}
                    value={this.state.value}
                    onChange={(e) => this.setState({ value: e.value }, this.handleChange)}
                    autoFocus={!this.props.config.disableAutoFocus}
                />
                {this.props.showApply && (
                    <div>
                        <button className="w-filter-apply" onClick={this.handleApply}>
                            {fI18n.t("frontend:filters.apply")}
                        </button>
                    </div>
                )}
            </div>
        );
    }
}
