export interface IFilter {
    field: string,
    caption?: string,
    config?: any,
    onChange?: (value: IFilterValue) => any,
    value?: IFilterValue,
    component: any,
}

export interface IFilterValue {
    field: string
    value: any,
    condition: string,
    caption: string,
    labelCaptionSeparator: string,
    label: string
}
