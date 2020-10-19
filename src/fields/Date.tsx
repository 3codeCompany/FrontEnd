import { IFieldProps } from "./Interfaces";
import * as React from "react";
import { fI18n } from "../lib/I18n";

import "./Date.sass";
import { Modal } from "../Modal";
import { RelativePositionPresets } from "../Positioner";

let moment: any = null;

export interface IDateProps extends IFieldProps {
    value: string;
    placeholder?: string;
}

export class Date extends React.Component<IDateProps, any> {
    public static defaultProps = {
        editable: true,
    };

    datePicker: any = null;
    MomentLocaleUtils: any = null;

    textField = React.createRef<HTMLInputElement>();

    constructor(props: IDateProps) {
        super(props);
        this.state = {
            value: null,
            date: undefined,
            libsLoaded: false,
            dateString: props.value ? props.value : null,
            modalVisible: false,
        };
    }

    public componentWillMount() {
        // prettier-ignore
        Promise.all([
            import("moment"),
            // @ts-ignore
            import("moment/locale/pl"), //import("moment/locale/" + fI18n.options.fallbackLng[0]),
            import("react-day-picker"), // @ts-ignore

            // @ts-ignore
            import("react-day-picker/moment"), // @ts-ignore


            // @ts-ignore
            import("react-day-picker/lib/style.css"),
            // @ts-ignore

        ]).then((imported: any[]) => {
            
            moment = imported[0].default;
            this.datePicker = imported[2].default;
            this.MomentLocaleUtils = imported[3].default;
            this.setState({
                date:
                    this.props.value && this.props.value != "0000-00-00"
                        ? moment(this.props.value, "YYYY-MM-DD").toDate()
                        : undefined,
                libsLoaded: true,
            });
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<IDateProps>, nextContext: any): void {
        // prettier-ignore
        Promise.all([
            import("moment"),
            // @ts-ignore
            import("moment/locale/pl"), //import("moment/locale/" + fI18n.options.fallbackLng[0]),
        ]).then((imported) => {
            moment = imported[0].default;
            this.setState({
                date: nextProps.value && nextProps.value != "0000-00-00" ? moment(nextProps.value, "YYYY-MM-DD").toDate() : undefined,
            });
        });
    }

    public handleOnChange = (date: Date) => {
        this.setState({ date: date, value: date, modalVisible: false });
        if (this.props.onChange) {
            this.props.onChange({
                name: this.props.name,
                type: "date",
                value: date ? moment(date).format("YYYY-MM-DD") : null,
                event: null,
                data: date,
            });
        }
    };

    public render() {
        const props = this.props;

        if (!props.editable) {
            return <div className="w-field-presentation w-field-presentation-date">{props.value}</div>;
        }
        if (this.state.libsLoaded == false) {
            return (
                <div className={"w-filter w-filter-date"}>
                    <div>
                        <i className="fa fa-cog fa-spin" />
                    </div>
                </div>
            );
        }

        return (
            <div className="w-date">
                <input
                    className={props.className}
                    type="text"
                    ref={this.textField}
                    value={this.state.date ? moment(this.state.date).format("YYYY-MM-DD") : ""}
                    onChange={() => {}}
                    onFocus={() => this.setState({ modalVisible: true })}
                    placeholder={props.placeholder}
                />
                <Modal
                    show={this.state.modalVisible}
                    onHide={() => this.setState({ modalVisible: false })}
                    target={() => this.textField.current}
                    relativePositionConf={RelativePositionPresets.bottomLeft}
                    shadow={false}
                >
                    <this.datePicker
                        locale={(fI18n.options.fallbackLng as string[])[0]}
                        localeUtils={this.MomentLocaleUtils}
                        selectedDays={this.state.date}
                        month={this.state.date}
                        onDayClick={this.handleOnChange}
                    />
                </Modal>
            </div>
        );
    }
}
