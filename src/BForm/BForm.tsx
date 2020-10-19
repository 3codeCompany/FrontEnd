import * as React from "react";

import { Comm, CommEvents } from "../lib/Comm";
import { IFieldChangeEvent } from "../fields";
import { Shadow } from "../Shadow";
import { ValidationError } from "./ValidationError";

interface IBFormEvent {
    form: BForm;
    inputEvent: React.FormEvent;
}

interface IBFormCommEvent {
    form: BForm;
    response: any;
}

type IBFormChildFunction = (formConf: any, data: any, form: BForm) => any;

interface IBFormProps {
    /**
     * ( default | inline | horizontal )
     */
    layoutType?: "default" | "horizontal";
    /**
     * This callback is fired when form input is changed
     * @callback
     * @param {object} keys: inputEvent, form
     */
    onChange?: (formEvent: IBFormEvent) => any;
    /**
     * This callback is fired when form input is submited preventin "action send"
     * @callback
     * @param {object} keys: inputEvent, form
     */
    onSubmit?: (formEvent: IBFormEvent) => any;
    /**
     * This callback is fired to prepare data to sends
     * @callback
     * @param {object} keys: inputEvent, form
     */
    onBeforeSend?: (formEvent: IBFormEvent) => any;
    /**
     * This callback is fired when validation error occured
     * @callback
     * @param {object} keys: response, form
     */
    onValidatorError?: (response: IBFormCommEvent) => any;
    /**
     * This callback is fired when server error occured
     * @callback
     * @param {object} keys: response, form
     */
    onError?: (response: IBFormCommEvent) => any;
    /**
     * This callback is fired after from submited with success
     * @callback
     * @param {object} keys: response, form
     */
    onSuccess?: (response: IBFormCommEvent) => any;
    /**
     * Input data for form inputs ( key = input name )
     */
    data?: any;
    /**
     * Form target action
     */
    action?: string;
    /**
     * Namespace for all fields in form
     */
    namespace?: string;

    editable?: boolean;

    loading?: boolean;
    children: IBFormChildFunction;
    formErrors?: string[];
    fieldErrors?: Map<string, string[]>;
    errors?: ValidationError;
    useFormTag?: boolean;
}

interface IBFormState {
    data: any;
    fieldErrors: Map<string, string[]>;
    formErrors: string[];
    isDirty: boolean;
    loading: boolean;
}

export type IApplyToFieldFn = (
    fieldName: string,
    defaultValue: any,
) => {
    value: any;
    layoutType: string;
    errors: string[];
    editable: boolean;
    onChange: (event: IFieldChangeEvent) => any;
};

export class BForm extends React.Component<IBFormProps, IBFormState> {
    public formTag: HTMLElement;
    private fieldsValues: {};

    public static defaultProps: Partial<IBFormProps> = {
        layoutType: "default",
        editable: true,
        fieldErrors: new Map<string, string[]>(),
        formErrors: [],
        useFormTag: true,
    };

    constructor(props: IBFormProps) {
        super(props);
        this.state = {
            data: props.data || {},
            fieldErrors: props.fieldErrors,
            formErrors: props.formErrors,
            isDirty: false,
            loading: props.loading || false,
        };

        // used to setup base data
        this.fieldsValues = {};
    }

    /**
     * Return form input data
     */
    public getData() {
        const data = Object.assign(this.state.data, {});
        const fields: { [index: string]: any } = Object.assign(this.fieldsValues, {});

        for (const i in data) {
            if (data[i] == undefined && fields[i] !== undefined) {
                data[i] = fields[i];
            }
        }
        return data;
    }

    public getErrors() {
        return { fieldErrors: this.state.fieldErrors, formErrors: this.state.formErrors };
    }

    /**
     * Handle validation error
     * @param {object} response
     */
    public handleValidatorError(response: any) {
        if (this.props.onValidatorError) {
            this.props.onValidatorError({ form: this, response });
        }

        this.setState({
            fieldErrors: response.fieldErrors,
            formErrors: response.formErrors || [],
        });

        this.forceUpdate();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBFormProps) {
        if (nextProps.data) {
            this.setState({ data: nextProps.data });
        }

        if (nextProps.loading != undefined) {
            this.setState({ loading: nextProps.loading });
        }

        if (nextProps.fieldErrors) {
            this.setState({ fieldErrors: nextProps.fieldErrors });
        }
        if (nextProps.formErrors) {
            this.setState({ formErrors: nextProps.formErrors });
        }

        if (nextProps.errors) {
            this.setState({
                fieldErrors: nextProps.errors.fieldErrors || new Map<string, string[]>(),
                formErrors: nextProps.errors.formErrors || [],
            });
        }
    }

    public submit(tmpCallbacks: { [index: string]: () => any } = null) {
        this.handleSubmit(null, tmpCallbacks);
    }

    // todo check type { ([index: string]:  { form: BForm; response: any} ) => any}
    public handleSubmit = (e: React.FormEvent, tmpCallbacks: any = {}) => {
        if (e) {
            e.preventDefault();
        }

        if (this.props.onSubmit) {
            this.props.onSubmit({ form: this, inputEvent: e as React.FormEvent<HTMLFormElement> });
        } else if (this.props.action) {
            const comm = new Comm(this.props.action);

            let data: { [index: string]: any } = {};
            if (this.props.namespace) {
                data[this.props.namespace] = this.getData();
            } else {
                data = this.getData();
            }

            comm.on(CommEvents.FINISH, () => this.setState({ loading: false }));
            comm.on(CommEvents.SUCCESS, (response) => {
                if (this.props.onSuccess) {
                    this.props.onSuccess({ form: this, response });
                }
                this.setState({
                    fieldErrors: new Map<string, string[]>(),
                    formErrors: [],
                });

                if (tmpCallbacks && tmpCallbacks[CommEvents.SUCCESS]) {
                    tmpCallbacks[CommEvents.SUCCESS]({ form: this, response });
                }
            });
            comm.on(CommEvents.VALIDATION_ERRORS, (response) => {
                this.handleValidatorError(response);
            });
            comm.on(CommEvents.ERROR, (response) => {
                if (this.props.onError) {
                    this.props.onError({ form: this, response });
                }
            });
            comm.setData(data);
            this.setState({ loading: true });
            comm.send();
        }

        return false;
    };

    public getHtmlNotationNameTranslators(fieldName: string) {
        const tmp = fieldName.replace(/\]/g, "");
        const arrayNotation = tmp.split("[");
        let dotNotation = arrayNotation.join(".");

        let get;
        try {
            dotNotation = dotNotation.replace(/\.([0-9]+)/g, "[$1]");
            get = new Function("obj", "try{ return obj." + dotNotation + "; }catch(e){ return undefined;}");
        } catch (e) {
            const err = "try{ return obj." + dotNotation + "; }catch(e){ return undefined;}";
            throw new Error(err + " " + e.message);
        }

        const set = (obj: any, path: string[], endValue: any) => {
            if (path.length > 1) {
                const currKey = path.shift();
                if (obj[currKey] == undefined) {
                    obj[currKey] = {};
                }
                set(obj[currKey], path, endValue);
            } else {
                obj[path[0]] = endValue;
            }
        };

        return { get, set, arrayNotation, dotNotation };
    }

    public handleInputChange(e: React.FormEvent | IFieldChangeEvent) {
        let name;
        let type;
        let value;
        // custom event data

        if ((e as IFieldChangeEvent).name !== undefined) {
            name = (e as IFieldChangeEvent).name;
            value = (e as IFieldChangeEvent).value;
            type = (e as IFieldChangeEvent).type;
        } else {
            const el = (e as React.FormEvent<HTMLElement>).target as HTMLInputElement;
            name = el.getAttribute("name");
            type = el.getAttribute("type");
            value = el.value;

            if (el.type == "file") {
                // @ts-ignore cant find right inferface
                value = e.files[0];
            }
        }

        const { get, set, arrayNotation } = this.getHtmlNotationNameTranslators(name);

        if (type == "checkbox") {
            const checked = (e as React.FormEvent<HTMLElement>).target as HTMLInputElement;

            if (!Array.isArray(this.state.data[name])) {
                if (!checked) {
                    this.state.data[name] = [];
                } else {
                    this.state.data[name] = [value];
                }
            } else {
                if (checked) {
                    this.state.data[name].push(value);
                } else {
                    const index = this.state.data[name].indexOf(value);
                    this.state.data[name].splice(index, 1);
                }
            }
        } else {
            set(this.state.data, arrayNotation, value);
        }
        set(this.fieldsValues, arrayNotation, value);

        this.setState({ data: this.state.data, isDirty: true });

        if (this.props.onChange) {
            this.props.onChange({ form: this, inputEvent: e } as IBFormEvent);
        }
    }

    public applyToField: IApplyToFieldFn = (name: string, defaultValue: any = null) => {
        let value;
        const { get, set, arrayNotation, dotNotation } = this.getHtmlNotationNameTranslators(name);

        value = get(this.state.data);
        if (value === undefined && defaultValue !== false) {
            set(this.state.data, arrayNotation, defaultValue);
        }
        if (get(this.state.fieldErrors) == undefined) {
            set(this.state.fieldErrors, arrayNotation, null);
        }

        // false - dont track
        if (defaultValue !== false) {
            set(
                this.fieldsValues,
                arrayNotation,
                this.props.data ? this.props.data[name] || defaultValue : defaultValue,
            );
        }

        if (value === null || (value === undefined && defaultValue !== null)) {
            value = defaultValue;
        }

        return {
            value,
            name,
            layoutType: this.props.layoutType,
            errors: this.state.fieldErrors.get(dotNotation),
            editable: this.props.editable,
            onChange: (e: React.FormEvent | IFieldChangeEvent) => {
                this.handleInputChange(e);
            },
        };
    };

    public render() {
        const layoutType = this.props.layoutType;

        const classes = [];
        if (layoutType == "horizontal") {
            classes.push("form-horizontal");
        } else if (layoutType == "default") {
            // classes.push('form-inline');
        }

        const Tag: any = this.props.useFormTag ? "form" : "div";

        return (
            <Tag
                ref={(form: HTMLElement) => (this.formTag = form)}
                className={classes.join(" ")}
                onSubmit={(e: React.FormEvent) => {
                    this.handleSubmit(e);
                    return false;
                }}
                style={{ position: "relative" }}
            >
                {this.state.formErrors.length > 0 && (
                    <ul className="bg-danger ">
                        {this.state.formErrors.map((el: string) => (
                            <li key={el}>{el}</li>
                        ))}
                    </ul>
                )}
                {this.props.children(this.applyToField, this.getData(), this)}

                <Shadow {...{ visible: this.state.loading, loader: true, container: () => this.formTag }} />
            </Tag>
        );
    }
}
