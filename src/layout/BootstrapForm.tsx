import * as React from "react";
import {
    CheckboxGroup,
    ConnectionsField,
    Date,
    File,
    Select,
    Switch,
    Text,
    Textarea,
    Wysiwyg,
} from "../ctrl/Fields";
import { FileList } from "../ctrl/FileLists";
import { Shadow } from "../ctrl/Overlays";
import Comm from "../lib/Comm";
import { Copyable } from "frontend/src/ctrl/Copyable";
import Icon from "../ctrl/Icon";

interface IWithBootstrapFormFieldProps {
    label?: string;
    onInfoClick?: (value) => any;
    help?: string;
    errors?: string[];
    className?: string;
    prefix?: string;
    suffix?: string;
    layoutType?: "horizontal" | "default";
    addInputClass?: boolean;
    editable?: boolean;
    copyable?: boolean;
    disabledClass?: string;
    labelClass?: string;
    value?: any;
    forwardedRef?: any;

}

const withBootstrapFormField = <P extends IWithBootstrapFormFieldProps>(Component: React.ComponentType<P>) => {
    return class  extends React.Component<P & IWithBootstrapFormFieldProps> {
        public static defaultProps: Partial<IWithBootstrapFormFieldProps> = {
            layoutType: "default",
            addInputClass: true,
        };

        public render() {
            const props = this.props;
            const addInputClass = this.props.addInputClass;
            const classes = ["form-group"];

            if (this.props.errors) {
                classes.push("has-error");
            }

            let className = addInputClass ? "form-control" : "";
            if (props.className) {
                className += " " + props.className;
            }

            let field;

            const { forwardedRef, ...fieldProps } = this.props as any;

            // const fieldProps: any = {};
            Object.assign(fieldProps, { className });

            if ((this.props.suffix || this.props.prefix) && this.props.editable) {

                field =
                    <div className="input-group">
                        {this.props.prefix && <div className="input-group-addon">{this.props.prefix}</div>}
                        <Component {...props} ref={forwardedRef} {...fieldProps} />
                        {this.props.suffix && <div className="input-group-addon">{this.props.suffix}</div>}
                    </div>;

            } else {
                field = <Component ref={forwardedRef} {...fieldProps} />;
            }
            let errors = [];
            if (props.errors) {

                if (!Array.isArray(props.errors)) {
                    errors = [props.errors];
                } else {
                    errors = props.errors;
                }
            }

            if (props.layoutType == "horizontal") {

                return (
                    <div className={classes.join(" ")}>
                        {this.props.label && <label className="col-sm-2 control-label">{props.label}</label>}
                        <div className="col-sm-10">
                            {field}
                            {props.help ?
                                <span className="help-block">{props.help} </span>
                                : ""}
                            {props.errors && this.props.editable ?
                                <span className="help-block">{errors.join(", ")} </span>

                                : ""}
                        </div>
                    </div>
                );
            }
            if (props.layoutType == "default") {
                return (
                    <div className={classes.join(" ")}>
                        {this.props.label && <label className={this.props.labelClass}>{this.props.label}
                        {this.props.copyable && <Copyable toCopy={this.props.value}/>}

                            {props.onInfoClick && <a style={{float: "right"}} onClick={props.onInfoClick}><Icon name={"OpenInNewWindow"}/></a>}
                        </label>}
                        {field}

                        {props.help ?
                            <span className="help-block">{props.help} </span>
                            : ""}
                        {props.errors && this.props.editable ?
                            <span className="help-block">{errors.join(", ")} </span>

                            : ""}
                        {/*.join(", ")*/}
                    </div>
                );
            }
        }

    };
};

interface IBFormEvent {
    form: BForm;
    inputEvent: Event;
}

interface IBFormCommEvent {
    form: BForm;
    response: any;
}

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
    children: (formConf: any, data: any, form: BForm) => any;
    formErrors?: string[];
    fieldErrors?: any;
    errors?: any;
    useFormTag?: boolean;
}

interface IBFormState {
    data: any;
    fieldErrors: any;
    formErrors: any;
    isDirty: boolean;
    loading: boolean;
}

class BForm extends React.Component<IBFormProps, IBFormState> {
    public formTag: HTMLFormElement;
    private fieldsValues: {};

    public static defaultProps: Partial<IBFormProps> = {
        layoutType: "default",
        editable: true,
        fieldErrors: {},
        formErrors: [],
        useFormTag: true,
    };

    constructor(props) {
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
        const fields = Object.assign(this.fieldsValues, {});

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
    public handleValidatorError(response) {
        if (this.props.onValidatorError) {
            this.props.onValidatorError({ form: this, response });
        }

        this.setState({
            fieldErrors: response.fieldErrors,
            formErrors: response.errors,
        });

        this.forceUpdate();
    }

    public componentWillReceiveProps(nextProps) {
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
            this.setState({ fieldErrors: nextProps.errors.fieldErrors || {}, formErrors: nextProps.errors.errors || [] });
        }

    }

    public componentDidMount() {

    }

    public submit( tmpCallbacks ) {

        this.handleSubmit(null, tmpCallbacks);
    }

    public handleSubmit(e, tmpCallbacks = {}) {
        if (e) {
            e.preventDefault();
        }

        if (this.props.onSubmit) {
            this.props.onSubmit({ inputEvent: e, form: this });
        } else if (this.props.action) {
            const comm = new Comm(this.props.action);

            let data = {};
            if (this.props.namespace) {
                data[this.props.namespace] = this.getData();
            } else {
                data = this.getData();
            }

            comm.on("finish", () => this.setState({ loading: false }));
            comm.on("success", (response) => {
                if (this.props.onSuccess) {
                    this.props.onSuccess({ form: this, response });
                }
                this.setState({
                    fieldErrors: {},
                    formErrors: [],
                });

                if (tmpCallbacks[Comm.EVENTS.SUCCESS]) {
                    tmpCallbacks[Comm.EVENTS.SUCCESS]({ form: this, response });
                }
            });
            comm.on("validationErrors", (response) => {
                this.handleValidatorError(response);
            });
            comm.on("error", (response) => {
                if (this.props.onError) {
                    this.props.onError({ form: this, response });
                }
            });
            comm.setData(data);
            this.setState({ loading: true });
            comm.send();
        }

        return false;
    }

    public getHtmlNotationNameTranslators(fieldName) {

        const tmp = fieldName.replace(/\]/g, "");
        const arrayNotation = tmp.split("[");
        let dotNotation = arrayNotation.join(".");

        let get;
        try {
            dotNotation = dotNotation.replace(/\.([0-9]+)/g, "[$1]");
            get = new Function("obj", "try{ return obj." + dotNotation + "; }catch(e){ return undefined;}");
        } catch (e) {
            console.error("try{ return obj." + dotNotation + "; }catch(e){ return undefined;}");
            console.error(e.message);
        }

        const set = (obj, path, endValue) => {

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

        return { get, set, arrayNotation };
    }

    public handleInputChange(e) {
        let name, type, value;
        // custom event data

        if (e.name !== undefined) {
            name = e.name;
            value = e.value;
            type = e.type;

        } else {
            name = e.target.getAttribute("name");
            type = e.target.getAttribute("type");
            value = e.target.value;

            if (e.target.type == "file") {
                value = e.target.files[0];
            }
        }

        const { get, set, arrayNotation } = this.getHtmlNotationNameTranslators(name);

        if (type == "checkbox") {
            const checked = e.target.checked;

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
            this.props.onChange({ form: this, inputEvent: e });
        }

    }

    public applyToField(name, defaultValue = null) {

        let value;
        const { get, set, arrayNotation } = this.getHtmlNotationNameTranslators(name);

        value = get(this.state.data);
        if (value === undefined && defaultValue !== false) {
            set(this.state.data, arrayNotation, defaultValue);
        }
        if (get(this.state.fieldErrors) == undefined) {
            set(this.state.fieldErrors, arrayNotation, null);
        }

        // false - dont track
        if (defaultValue !== false) {
            set(this.fieldsValues, arrayNotation, this.props.data ? this.props.data[name] || defaultValue : defaultValue);
        }

        // console.log(get(this.state.fieldErrors))

        return {
            value,
            name,
            layoutType: this.props.layoutType,
            errors: get(this.state.fieldErrors),
            editable: this.props.editable,
            onChange: (e) => {
                this.handleInputChange(e);
            },
        };
    }

    public render() {
        const layoutType = this.props.layoutType;

        const classes = [];
        if (layoutType == "horizontal") {
            classes.push("form-horizontal");
        } else if (layoutType == "default") {
            // classes.push('form-inline');
        }

        const Tag = this.props.useFormTag ? "form" : "div";

        return (
            <Tag ref={(form) => this.formTag = form} className={classes.join(" ")}
                 onSubmit={this.handleSubmit.bind(this)} style={{ position: "relative" }}>

                {this.state.formErrors.length > 0 &&
                <ul className="bg-danger ">
                    {this.state.formErrors.map((el) => <li>{el}</li>)}
                </ul>}
                {this.props.children(this.applyToField.bind(this), this.getData(), this)}

                <Shadow {...{ visible: this.state.loading, loader: true, container: () => this.formTag }} />
            </Tag>
        );
    }
}

// const BText = withBootstrapFormField2(Text);

const BText = withBootstrapFormField(Text);
const BTextarea = withBootstrapFormField(Textarea);
const BSelect = withBootstrapFormField(Select);
const BSwitch = withBootstrapFormField(Switch);
const BCheckboxGroup = withBootstrapFormField(CheckboxGroup);
const BDate = withBootstrapFormField(Date);
const BFile = withBootstrapFormField(File);
const BWysiwig = withBootstrapFormField(Wysiwyg);
const BConnectionsField = withBootstrapFormField(ConnectionsField);
const BFileList = withBootstrapFormField(FileList);
const BContainer = withBootstrapFormField((props) => <div>{props.children}</div>);

export {
    BForm,
    BText,
    BSwitch,
    BSelect,
    BCheckboxGroup,
    BTextarea,
    BDate,
    BFile,
    BWysiwig,
    BConnectionsField,
    BFileList,
    BContainer,
    withBootstrapFormField as withBootstrapFormField,
};
