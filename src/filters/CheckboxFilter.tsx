import * as React from "react";
import { fI18n } from "../lib/I18n";
import AbstractFilter, { IFilterProps } from "./AbstractFilter";
import { IOption } from "../fields/Interfaces";
import ReactDOM from "react-dom";

import "./SelectFilter.sass";
import { CheckboxGroup } from "../fields";
import { toOptions } from "../fields/Utils";

export interface ISelectFilterProps extends IFilterProps {
    config: {
        content: IOption[];
        default?: string | number;
        disableAutoFocus?: boolean;
        columnsCount?: number;
    };
}

export default class CheckboxFilter extends AbstractFilter<ISelectFilterProps> {
    public select: any;

    public static defaultProps: Partial<ISelectFilterProps> = {
        caption: "",
        config: {
            content: [],
            default: "",
            disableAutoFocus: false,
            columnsCount: 2,
        },
    };

    constructor(props: ISelectFilterProps) {
        super(props);
        let value: any = [];
        if (props.value) {
            value = props.value;
        }

        if(props.config.default && value.length === 0) {
            value = props.config.default
        }

        this.state = {
            value,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: ISelectFilterProps) {
        let value: any = [];
        if (nextProps.value) {
            value = nextProps.value;

            this.setState({
                value,
            });
        }
    }

    public getValue() {
        const labels = toOptions(this.props.config.content)
            .filter((el) => this.state.value.includes(el.value))
            .map((el) => el.label);

        const condition = "IN";

        return {
            field: this.props.field,
            value: this.state.value,
            condition,
            caption: this.props.caption,
            labelCaptionSeparator: ":",
            label: labels.join(", "),
        };
    }

    public handleChange = (e: React.FormEvent<HTMLSelectElement>) => {
        this.setState({
            value: this.getValue().value,
        });

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

                <div>
                    <CheckboxGroup
                        options={content}
                        value={this.state.value}
                        onChange={(ev) => this.setState({ value: ev.value })}
                        columns="vertical"
                        columnsCount={config.columnsCount | 2}
                    />
                </div>

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
