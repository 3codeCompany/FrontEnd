export interface Option {
    value: string | number;
    label: string | number;
}

export interface IOption {
    value: string | number;
    label: string | number;
}

export interface IFieldProps {
    className?: string,
    name?: string,
    value?: any,
    onChange?: { (changeData: IFieldChangeEvent): any },
    disabled?: boolean,
    editable?: boolean
    style?: any,
    placeholder?: string,
    autoFocus?: boolean
    disabledClass?: string
}

export interface IFieldChangeEvent {
    name: string
    type: string
    value: any
    event: Event,
    data: any
}
