import * as React from "react";

import { fI18n } from "../../utils/I18n";
import AbstractFilter, { IFilterProps } from "./AbstractFilter";
import { Switch } from "../Fields";
import { IOption } from "../fields/Interfaces";

import "./SwitchFilter.sass";

interface ISwitchFilterProps extends IFilterProps {
    config: {
        content: IOption[];
    };
}

export default class SwitchFilter extends AbstractFilter<ISwitchFilterProps> {
    constructor(props: ISwitchFilterProps) {
        super(props);
        this.state = { value: props.value ? props.value.value : null };
    }

    public componentWillReceiveProps(nextProps: ISwitchFilterProps) {
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
        const {caption} = this.props;
        return (
            <div className="w-filter w-filter-switch">
                {caption != "" && <div className={"w-filter-title"}>{caption}</div>}
                <Switch
                    options={this.props.config.content}
                    value={this.state.value}
                    onChange={(e) => this.setState({ value: e.value }, this.handleChange)}
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