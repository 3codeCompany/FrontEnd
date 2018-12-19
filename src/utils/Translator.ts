declare var LANGUAGE: string;

export let langs: any = {};

export const translate = (str: string): string => {
    if (langs[LANGUAGE] != undefined) {
        if (langs[LANGUAGE][str] != undefined) {
            return langs[LANGUAGE][str];
        }
    }

    return str;
};
