import i18next, { BackendModule } from "i18next";
import langContainer from "./translation/LangContainer";

import { configGetAll } from "../_backoffice/Config";

const config = configGetAll();

const XHR: BackendModule = {
    type: "backend",
    init(services: any, backendOptions: any, i18nextOptions: any) {
        /* use services and options */
    },
    read(language: string, namespace: string, callback: any) {
        langContainer.get(language, (result: any) => {
            if (result.lang[namespace] == undefined) {
                callback("Undefined namespace", null);
            } else {

                callback(null, result.lang[namespace]);
            }
        });
    },
    readMulti(languages: string[], namespace: string[], callback: any) {
        throw new Error("Unsupported I18n readMulti");
    },
    // only used in backends acting as cache layer
    save(language: string, namespace: string, data: any) {
        // store the translations
        console.log("bbb");
    },
    create(languages: string[], namespace: string, key: string, fallbackValue: string) {
        /* save the missing translation */
        console.log("aaa");
    },
};

i18next.use(XHR).init(
    {
        lng: "en",
        fallbackLng: config.translations.defaultLanguage,
        debug: false,
        /*resources: {
            en: {
                translation: {
                    "key": "hello world"
                }
            }
        },*/
        ns: ["translation", "frontend"],
    },
    (err: any, t: any) => {
        // initialized and ready to go!
    },
);

// const fI18n = instance;

export { i18next as fI18n, langContainer };
