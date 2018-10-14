import * as i18n from "i18next";
// import * as LanguageDetector from "i18next-browser-languagedetector";
import {reactI18nextModule} from "react-i18next";

import {configGet} from "../backoffice/Config";
import {Comm} from "./Comm";

declare var PRODUCTION: any;

class LangContainer {
    public langs: { [index: string]: () => Promise<any> } = {};
    public add = (lang: string, getter: (() => Promise<any>)) => {
        this.langs[lang] = getter;
    };

    public get = (lang: string, callback: ((result: any) => any)) => {
        if (this.langs[lang] !== undefined) {
            this.langs[lang]().then((result) => {
                callback(result);
            });
        } else {
            console.log(`Lang ${lang} is not defined`);
        }
    };
}

const langContainer = new LangContainer();

const XHR = {
    type: "backend",
    init(services: any, backendOptions: any, i18nextOptions: any) {
        /* use services and options */
    },
    read(language: string, namespace: string, callback: any) {
        langContainer.get(language, (result) => {
            if (result.lang[namespace] == undefined) {
                callback("Undefined namespace", null);
            } else {
                callback(null, result.lang[namespace]);
            }
        });
    },
    readMulti(language: string, namespace: string, callback: any) {
        throw new Error("Unsupported I18n readMulti");
    },
    // only used in backends acting as cache layer
    save(language: string, namespace: string, data: any) {
        // store the translations
    },
    create(language: string, namespace: string, key: string, fallbackValue: string) {
        /* save the missing translation */
    },
};

const instance = i18n
    .use(XHR)
    // .use(LanguageDetector)
    .use(reactI18nextModule)
    .init({
        // lng: configGet("translations.defaultLanguage"),
        fallbackLng: configGet("translations.defaultLanguage"),
        // debug: !PRODUCTION,
        debug: false,
        saveMissing: true,
        ns: ["translation", "frontend"],
        missingKeyHandler(lng, ns, key, fallbackValue) {
            //if (!PRODUCTION) {
            //if (lng[0] != "pl") {
            console.log(`i18n  key: ${key}, value: ${fallbackValue}, ns: ${ns}, lang: ${lng}`);
            //}
            //}
        },
        react: {
            wait: true,
        },
    });
instance.on("languageChanged", (lng) => {
    Comm._get(configGet("translations.backendLangChanged").replace("{{lng}}", lng));
});
const fI18n = instance;
export {fI18n, langContainer};
