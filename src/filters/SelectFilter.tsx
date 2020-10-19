import * as React from "react";
import { fI18n } from "../lib/I18n";
import AbstractFilter, { IFilterProps } from "./AbstractFilter";
import { IFieldChangeEvent, IOption } from "../fields/Interfaces";

import "./SelectFilter.sass";
import { CheckboxGroup, Select } from "../fields";
import { toOptions } from "../fields/Utils";

export interface ISelectFilterProps extends IFilterProps {
    config: {
        content: IOption[];
        default?: string | number;
        multiselect?: boolean;
        disableAutoFocus?: boolean;
        mode?: "list" | "dropdown";
        applyOnChange?: boolean;
    };
}

export default class SelectFilter extends AbstractFilter<ISelectFilterProps> {
    public select: any;

    public static defaultProps: Partial<ISelectFilterProps> = {
        caption: "",
        config: {
            content: [],
            default: "",
            multiselect: false,
            disableAutoFocus: false,
            mode: "dropdown",
            applyOnChange: true,
        },
    };

    constructor(props: ISelectFilterProps) {
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

    public UNSAFE_componentWillReceiveProps(nextProps: ISelectFilterProps) {
        let value: any = "";
        if (nextProps.value) {
            value = nextProps.value.value;
        } else {
            value = this.props.config.default;
        }
        if (this.props.config.multiselect && value == "") {
            value = [];
        }

        this.setState({
            value,
        });
    }

    public getValue() {
        let values = [];
        let labels = [];
        if (this.props.config.multiselect) {
            values = this.state.value;
            labels = toOptions(this.props.config.content)
                .filter((el) => this.state.value.includes(el.value))
                .map((el) => el.label);
        } else {
            values = this.state.value;
            labels = toOptions(this.props.config.content)
                .filter((el) => el.value == this.state.value)
                .map((el) => el.label);
        }

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

    public handleChange = (ev: IFieldChangeEvent) => {
        this.setState({ value: ev.value }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.getValue());
            }

            if (this.props.onApply && this.props.config.applyOnChange) {
                this.props.onApply(this.getValue());
            }
        });
    };

    public handleApply = () => {
        this.setState({ show: false });
        if (this.props.onApply) {
            this.props.onApply(this.getValue());
        }
    };

    public render() {
        const { config, caption } = this.props;
        let content: IOption[];
        if (!Array.isArray(this.props.config.content)) {
            content = Object.entries(this.props.config.content).map(([value, label]) => ({
                value,
                label,
            })) as IOption[];
        } else {
            content = this.props.config.content;
        }

        return (
            <div className={"w-filter w-filter-select"}>
                {caption != "" && <div className={"w-filter-title"}>{caption}</div>}
                {this.props.config.multiselect && (
                    <div>
                        <CheckboxGroup
                            options={content}
                            value={this.state.value}
                            onChange={(ev) => this.setState({ value: ev.value })}
                            columns="vertical"
                            columnsCount={1}
                        />
                    </div>
                )}
                {!this.props.config.multiselect && (
                    <Select
                        options={content}
                        autoFocus={!this.props.config.disableAutoFocus}
                        value={this.state.value}
                        onChange={this.handleChange}
                        mode={this.props.config.mode}
                    />
                )}
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
