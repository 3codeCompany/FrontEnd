import * as React from "react";
import { BDate, BSelect, BSwitch, BText, BTextarea } from "../BForm";
import { IFieldChangeEvent, IOption } from "../fields";
import { PrintJSON } from "../PrintJSON";

interface IFieldConfig {
    name: string;
    label: string;
    type: string;
    default?: string | number;
    options?: IOption[];
}

export interface IFormBuilderProps {
    fields: IFieldConfig[];
    values?: { [index: string]: string | number };
    onChange?: (data: { [index: string]: string | number }) => any;
}

interface IState {
    currentValues: { [index: string]: string | number };
}

export class FormBuilder extends React.Component<IFormBuilderProps, IState> {
    public fields: any = {
        BText,
        BDate,
        BTextarea,
        BSwitch,
        BSelect,
    };

    public static defaultProps: Partial<IFormBuilderProps> = {
        values: {},
    };

    constructor(props: IFormBuilderProps) {
        super(props);

        const defaults = props.fields.reduce((p: { [index: string]: string | number }, c: IFieldConfig) => {
            p[c.name] = c.default;
            return p;
        }, {});

        this.state = {
            currentValues: { ...defaults, ...this.props.values },
        };
    }

    private dataChanged = () => {
        if (this.props.onChange) {
            this.props.onChange(this.state.currentValues);
        }
    };

    public render() {
        const { fields } = this.props;
        const { currentValues } = this.state;
        return (
            <div className="w-form-builder">
                {fields.map((field) => {
                    const Component: any = this.fields[field.type];
                    return (
                        <Component
                            key={field.name}
                            label={field.label}
                            onChange={(e: IFieldChangeEvent) => {
                                const fieldValues = currentValues;
                                fieldValues[field.name] = e.value;
                                this.setState({ currentValues: fieldValues }, this.dataChanged);
                            }}
                            {...(field.options ? { options: field.options } : {})}
                            value={currentValues[field.name] || field.default} /*help={field.default}*/
                        />
                    );
                })}
            </div>
        );
    }
}
