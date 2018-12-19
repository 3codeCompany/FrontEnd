import {IFilter} from "../filters/Intefaces";
import {ConnectionFilter, DateFilter, NumericFilter, SelectFilter, SwitchFilter, TextFilter} from "../Filters";
import {Option} from "../fields/Interfaces";

export class FilterHelper {
    private data: IFilter;

    constructor(initData: Partial<IFilter>) {
        this.data = {
            field: null,
            component: null,
            ...initData,
        };
    }

    public static date(field, caption) {
        return new FilterHelper({
            field,
            caption,
            component: DateFilter,
        });
    }

    public static number(field, caption) {
        return new FilterHelper({
            field,
            caption,
            component: NumericFilter,
        });
    }

    public static text(field, caption, extendedInfo = true) {
        return new FilterHelper({
            field,
            caption,
            component: TextFilter,
            config: {
                extendedInfo,
            },
        });
    }

    public static connection(field, caption, config) {
        return new FilterHelper({
            field,
            caption,
            component: ConnectionFilter,
            config,
        });
    }

    public static select(field, caption, content: Option[], multi: boolean = false, defaultValue = "") {
        return new FilterHelper({
            field,
            caption,
            config: {
                multiselect: multi,
                content,
                _default: defaultValue,
            },
            component: SelectFilter,
        });
    }

    public static switch(field, caption, content: Option[]) {
        return new FilterHelper({
            field,
            caption,
            config: {
                content,
            },
            component: SwitchFilter,
        });
    }
    
    

    public get(): IFilter {
        return this.data;
    }

}
