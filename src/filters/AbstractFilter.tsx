import { IFilterValue } from "../Table/Interfaces";
import * as React from "react";

export interface IFilterProps {
    /**
     * Field name to apply filter
     */
    field: string;
    /**
     * Caption
     */
    caption: string;

    /**
     * On filter change
     * @param filterValue
     */
    onChange?: (filterValue: IFilterValue) => any;
    /**
     * On filter apply
     * @param filterValue
     */
    onApply?: (filterValue: IFilterValue) => any;
    /**
     * Some config values
     */
    config?: any;
    /**
     * Show apply button
     */
    showApply?: boolean;

    /**
     * Filter value
     */
    value: any;
}
export default class AbstractFilter<T> extends React.Component<T, any> {
    public static defaultProps: Partial<IFilterProps> = {
        config: {},
    };
}
