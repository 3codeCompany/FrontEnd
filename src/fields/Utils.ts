import { IOption } from "./Interfaces";


export const checkIncludes = (options: any, value: string | number) => {
    const element = options.filter((el: IOption | string) => {
        // @ts-ignore
        if (el.value !== undefined) {
            // @ts-ignore
            return el.value == value;
        } else {
            return el == value;
        }
    });
    return element.length > 0;
};

export const toOptions = (options: IOption[] | { [index: string]: string }): IOption[] => {
    if (Array.isArray(options)) {
        return options as IOption[];
    } else {
        return Object.entries(options).map(([value, label]) => ({ value, label }));
    }
};
