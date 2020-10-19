import * as React from "react";
import { BDate, BForm, BSelect, BSwitch, BText, BTextarea } from "../BForm";
import { IFieldChangeEvent, IOption } from "../fields";
import { PrintJSON } from "../PrintJSON";
import { deepCopy, fI18n } from "../lib";
import { Row } from "../Row";

import "./FormBuilderSchemaGenerator.sass";
import { FormBuilder } from "./FormBuilder";
import { Icon } from "../Icon";
import { confirmDialog } from "../ConfirmDialog";
import { RelativePositionPresets } from "../Positioner";

interface IFieldConfig {
    name: string;
    label: string;
    type: string;
    default?: string | number;
    options?: IOption[];
}

export interface IFormBuilderProps {
    fields: IFieldConfig[];

    onChange?: (data: IFieldConfig[]) => any;
}

interface IState {
    currentField: any;
    formErrors: Map<string, string[]>;
    editedIndex: number;
}

export class FormBuilderSchemaGenerator extends React.Component<IFormBuilderProps, IState> {
    public static defaultProps: Partial<IFormBuilderProps> = {
        fields: [],
    };

    constructor(props: IFormBuilderProps) {
        super(props);

        this.state = {
            currentField: {
                type: "BText",
            },
            editedIndex: -1,
            formErrors: new Map<string, string[]>(),
        };
    }

    private cancelEdition = () => {
        this.setState({
            currentField: {
                type: "BText",
            },
            editedIndex: -1,
        });
    };
    private handleFieldEdit = (index: number) => {
        this.setState({
            currentField: deepCopy(this.props.fields[index]),
            editedIndex: index,
        });
    };
    private handleMoveUp = (index: number) => {
        this.props.fields.splice(index--, 0, this.props.fields.splice(index, 1)[0]);
        this.props.onChange(this.props.fields);
    };
    private handleMoveDown = (index: number) => {
        this.props.fields.splice(index++, 0, this.props.fields.splice(index, 1)[0]);
        this.props.onChange(this.props.fields);
    };
    private handleDelete = (index: number, e: React.MouseEvent) => {
        confirmDialog(fI18n.t("frontend:formBuilder.confirmFieldDelete"), {
            target: () => e.currentTarget as HTMLElement,
            relativePositionConf: RelativePositionPresets.bottomRight,
        }).then(() => {
            this.props.fields.splice(index, 1);
            this.props.onChange(this.props.fields);
        });
    };

    private handleAddField = () => {
        const { currentField } = this.state;
        const errors: Map<string, string[]> = new Map<string, string[]>();
        this.setState({ formErrors: errors });
        if (this.props.onChange) {
            if (!currentField.name) {
                errors.set("name", [fI18n.t("frontend:formBuilder.fieldIsRequired")]);
            }
            if (this.state.editedIndex === -1) {
                for (const el of this.props.fields) {
                    if (el.name == currentField.name) {
                        errors.set("name", [fI18n.t("frontend:formBuilder.nameAlreadyExists")]);
                    }
                }
            }

            if (!currentField.type) {
                errors.set("type", [fI18n.t("frontend:formBuilder.fieldIsRequired")]);
            }
            if (!currentField.label) {
                errors.set("label", [fI18n.t("frontend:formBuilder.fieldIsRequired")]);
            }

            if (errors.size == 0) {
                let curr = this.state.currentField;

                if (curr.options !== undefined && !Array.isArray(curr.options)) {
                    const lines = this.state.currentField.options.replace(/^\s+|\s+$/g, "").split("\n");
                    const options = lines.map((el: string) => {
                        const [value, label] = el.split(";");
                        return { value, label };
                    });
                    // curr.options = options;
                    curr = { ...curr, options };
                }

                if (this.state.editedIndex === -1) {
                    this.props.onChange(this.props.fields.concat({ ...curr }));
                } else {
                    this.props.fields[this.state.editedIndex] = curr;
                    this.props.onChange(this.props.fields);
                }
            } else {
                this.setState({ formErrors: errors });
            }
        }
    };

    public render() {
        const fieldsConf = [
            { type: "BText", label: "Tekstowe", options: false },
            { type: "BTextarea", label: "Tekstowe wiele lini", options: false },
            { type: "BDate", label: "Data", options: false },
            { type: "BSelect", label: "Jednokrotnego wyboru [lista]", options: true },
            { type: "BSwitch", label: "Jednokrotnego wyboru [przełącznik]", options: true },
            { type: "BCheckboxGroup", label: "Wielokrotnego wyboru", options: true },
        ];
        const currentConfig = fieldsConf.filter((el) => el.type == this.state.currentField.type)[0];

        const data = this.state.currentField;
        if (data.options && Array.isArray(data.options)) {
            data.options = data.options
                .reduce((p: string, option: IOption) => p + option.value + ";" + option.label + "\n", "")
                .replace(/^\s+|\s+$/g, "");
        }

        return (
            <div className="w-form-builder-schema-generator">
                <Row noGutters={false}>
                    <>
                        <div className="w-form-builder-schema-generator-title">Dodaj / edytuj pole</div>
                        <BForm
                            data={data}
                            onChange={(event) => this.setState({ currentField: event.form.getData() })}
                            fieldErrors={this.state.formErrors}
                            useFormTag={false}
                        >
                            {(form) => (
                                <>
                                    <BSelect
                                        label={fI18n.t("frontend:formBuilder.fieldType")}
                                        options={fieldsConf.map((el) => ({ value: el.type, label: el.label }))}
                                        {...form("type", "BText")}
                                    />
                                    <BText label={fI18n.t("frontend:formBuilder.name")} {...form("name")} />
                                    <BText label={fI18n.t("frontend:formBuilder.label")} {...form("label")} />
                                    <BSwitch
                                        label={fI18n.t("frontend:formBuilder.required")}
                                        options={[{ value: 0, label: "Nie" }, { value: 1, label: "Tak" }]}
                                        {...form("required", 0)}
                                    />

                                    <BText label={fI18n.t("frontend:formBuilder.default")} {...form("default")} />
                                    {currentConfig.options && (
                                        <>
                                            <BTextarea
                                                label={fI18n.t("frontend:formBuilder.fieldOptions")}
                                                help={"Format: oddzielne linie w fromacie wartoś;etykieta"}
                                                style={{ height: 250 }}
                                                {...form("options")}
                                            />
                                        </>
                                    )}
                                    {/*<BText
                                        label={fI18n.t("frontend:formBuilder.rowConfig")}
                                        help={"Nie obowiązkowe. Nr wiersza + ilość zajmowanego miejsca ( od 1 do 12 )"}
                                        {...form("layoutConfig")}
                                    />*/}
                                    <a
                                        style={{ width: "100%" }}
                                        className="btn btn-primary "
                                        onClick={this.handleAddField}
                                    >
                                        {this.state.editedIndex == -1
                                            ? fI18n.t("frontend:add")
                                            : fI18n.t("frontend:formBuilder.change")}
                                    </a>
                                    {this.state.editedIndex != -1 && (
                                        <a
                                            style={{ width: "100%" }}
                                            className="btn btn-default "
                                            onClick={this.cancelEdition}
                                        >
                                            {fI18n.t("frontend:formBuilder.cancelEdition")}
                                        </a>
                                    )}
                                </>
                            )}
                        </BForm>
                        {/*<PrintJSON json={this.state.currentField} />
                        <hr />
                        <PrintJSON json={this.props.values} />*/}
                    </>
                    <>
                        <div className="w-form-builder-schema-generator-title">Lista pól</div>
                        <div className="w-form-builder-schema-generator-fields">
                            {this.props.fields.map((el: IFieldConfig, key: number) => (
                                <div key={el.name} onClick={() => this.handleFieldEdit(key)}>
                                    {/*<Icon name="FieldNotChanged" />*/}
                                    <b>
                                        {key + 1}. {el.label}
                                    </b>{" "}
                                    [{el.name}]
                                    <div>
                                        {key != 0 && (
                                            <a
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleMoveUp(key);
                                                }}
                                            >
                                                <Icon name="Up" />
                                            </a>
                                        )}
                                        {key + 1 != this.props.fields.length && (
                                            <a
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.handleMoveDown(key);
                                                }}
                                            >
                                                <Icon name="Down" />
                                            </a>
                                        )}
                                        <a
                                            onClick={(e) => {
                                                e.persist();
                                                e.stopPropagation();
                                                this.handleDelete(key, e);
                                            }}
                                        >
                                            <Icon name="ChromeClose" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                    <>
                        <div className="w-form-builder-schema-generator-title">Podgląd</div>
                        <ErrorBoundary>
                            <FormBuilder fields={this.props.fields} />
                        </ErrorBoundary>
                    </>
                </Row>
            </div>
        );
    }
}

class ErrorBoundary extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public UNSAFE_componentWillReceiveProps() {
        this.setState({ hasError: false });
    }

    public static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: any, info: any) {
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }

    public render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error.message}</pre>
                    <pre>
                        {this.state.error.fileName}:{this.state.error.lineNumber}
                    </pre>
                </>
            );
        }

        return this.props.children;
    }
}
