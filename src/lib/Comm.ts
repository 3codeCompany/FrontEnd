import { ValidationError } from "../BForm/ValidationError";

type IResponseCallback = (response: any) => any;
interface IErrorFallbackData {
    url: string;
    input: any;
    response: any;
}

declare var PRODUCTION: any;

export enum CommEvents {
    BEFORE_SEND = "beforeSend",
    PROGRESS = "progress",
    RESPONSE = "response",
    ERROR = "error",
    CONNECTION_ERROR = "connectionError",
    SUCCESS = "success",
    VALIDATION_ERRORS = "validationErrors",
    FINISH = "finish",
}

class Comm {
    public static basePath = "";
    public static errorFallback: (data: IErrorFallbackData) => any = null;

    public static onStart: Array<(url: string, data: any, method: string) => any> = [];
    public static onFinish: Array<(url: string, inputData: any, response: any, method: string) => any> = [];

    public static EVENTS = {
        BEFORE_SEND: "beforeSend",
        PROGRESS: "progress",
        RESPONSE: "response",
        ERROR: "error",
        CONNECTION_ERROR: "connectionError",
        SUCCESS: "success",
        VALIDATION_ERRORS: "validationErrors",
        FINISH: "finish",
    };

    public debug: boolean = true;

    private readonly registredEvents: any;
    private readonly method: string;
    private readonly url: string;
    private data: any;
    private readonly namespace: string;
    private xhr: XMLHttpRequest;

    constructor(url: string, method = "POST") {
        this.url = url;
        this.data = {};
        this.namespace = null;

        this.registredEvents = {
            beforeSend: [],
            progress: [],
            response: [],
            error: [],
            connectionError: [],
            success: [],
            validationErrors: [],
            finish: [],
        };
        this.method = method;

        this.xhr = null;
    }

    public on(event: CommEvents, callback: IResponseCallback) {
        if (!Array.isArray(this.registredEvents[event])) {
            throw new Error("Unknow event: " + event);
        } else {
            this.registredEvents[event].push(callback);
        }
    }

    public callEvent(event: CommEvents, data: any) {
        this.registredEvents[event].map((el: IResponseCallback) => el(data));
    }

    public setData(data: any) {
        this.data = data;
    }

    public appendFormData(FormData: FormData, data: any, name = "") {
        if (data instanceof FileList) {
            for (let i = 0; i < data.length; i++) {
                // get item
                const file = data.item(i);
                FormData.append(name + "[]", file);
            }
            return;
        }

        if (Object.prototype.toString.call(data) == "[object File]") {
            FormData.append(name, data);
            return;
        }

        if (typeof data === "object" && data != null) {
            if (Array.isArray(data) && data.length == 0) {
                // for emtpty arrays sending empty value
                FormData.append(name, "");
            } else {
                Object.entries(data).map(([index, value]) => {
                    if (name == "") {
                        this.appendFormData(FormData, value, index);
                    } else {
                        // test for array in field name
                        const openBracket = index.indexOf("[");
                        let newName = name + "[" + index + "]";
                        if (openBracket != -1) {
                            newName = name + "[" + index.slice(0, openBracket) + "]" + index.slice(openBracket);
                        }
                        this.appendFormData(FormData, value, newName);
                    }
                });
            }
        } else {
            FormData.append(name, data == null ? "" : data);
        }
    }

    public prepareData() {
        let data: any = {};
        if (this.namespace) {
            data[this.namespace] = this.data;
        } else {
            data = this.data;
        }
        return data;
    }

    public debugError(error: string) {
        if (Comm.errorFallback) {
            Comm.errorFallback({
                url: Comm.basePath + this.url,
                input: this.data,
                response: error,
            });
        } else {
            const errorWindow = window.open("", "frontend-debug-window", "width=1000,height=800");
            errorWindow.focus();
            try {
                const json = JSON.parse(error);
                errorWindow.document.write("2<pre>" + JSON.stringify(json, null, 2) + "</pre>");
                if (json.__arrowException?.trace) {
                    errorWindow.document.write("<h4>Trace:</h4><pre>" + json.__arrowException.trace + "</pre>");
                }
            } catch (e) {
                errorWindow.document.write(error);
                //errorWindow.document.write("<pre>" + e + "</pre>");
            }

            errorWindow.focus();
        }
    }

    public abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    public send(): XMLHttpRequest {
        const data = this.prepareData();

        if (typeof PRODUCTION !== "undefined" && PRODUCTION === false) {
            console.log("Frontend Comm dev debug. Sending on: " + Comm.basePath + this.url);
            if (Object.entries(data).length > 0) {
                console.log(data, "sended");
            }
        }

        const formData = new FormData();
        if (this.method == "POST") {
            this.appendFormData(formData, data);
        }

        this.callEvent(CommEvents.BEFORE_SEND, data);

        this.xhr = new XMLHttpRequest();

        this.xhr.upload.onprogress = (event) => {
            this.callEvent(CommEvents.PROGRESS, {
                loaded: event.loaded,
                percent: Math.round((event.loaded / event.total) * 100),
            });
        };

        this.xhr.onreadystatechange = () => {
            /*if (!PRODUCTION) {
                //console.log("phpstorm://open?url=file://C:\\dev\\www\\esotiq.com//vendor/arrow/shop/views/admin/orders/orderscontroller/index.component.tsx&line=1")
                if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {
                    const hash = this.xhr.getResponseHeader("ARROW_DEBUG_ROUTE_HASH");
                    if (hash != null) {
                        ideConnector.refreshRoute(hash);
                    }
                }
            }*/

            if (this.xhr.readyState === 4) {
                if (this.xhr.status === 200) {
                    let exceptionOccured = false;
                    let data: any;
                    try {
                        this.callEvent(CommEvents.RESPONSE, this.xhr.response);
                        data = JSON.parse(this.xhr.response);
                        if (data.__arrowException !== undefined) {
                            throw data;
                        }
                    } catch (e) {
                        exceptionOccured = true;
                        if (this.registredEvents.error.length == 0) {
                            this.debugError(this.xhr.response);
                        } else {
                            if (this.debug) {
                                this.debugError(this.xhr.response);
                            }

                            this.callEvent(CommEvents.ERROR, this.xhr.response);
                        }
                    }

                    if (!exceptionOccured) {
                        if (data.errors === undefined && data.accessDeny === undefined) {
                            this.callEvent(CommEvents.SUCCESS, data);
                        } else if (data.accessDeny !== undefined) {
                            alert("Access deny " + data.accessDeny);
                        } else {
                            const validationErrors = new ValidationError();
                            validationErrors.formErrors = data.errors || [];
                            for (const field in data.fieldErrors) {
                                validationErrors.fieldErrors.set(field, data.fieldErrors[field]);
                            }
                            this.callEvent(CommEvents.VALIDATION_ERRORS, validationErrors);
                        }
                    }
                } else {
                    // 0 == abotreted
                    if (this.xhr.status != 0) {
                        this.debugError(this.xhr.responseText);
                        this.callEvent(CommEvents.CONNECTION_ERROR, this.xhr.response);
                    }
                }
                this.callEvent(CommEvents.FINISH, this.xhr);

                if (Comm.onFinish.length > 0) {
                    for (const cb of Comm.onFinish) {
                        cb(this.url, data, this.xhr.responseText, this.method);
                    }
                }
            }
        };

        if (Comm.onStart.length > 0) {
            for (const cb of Comm.onStart) {
                cb(this.url, data, this.method);
            }
        }

        this.xhr.open(this.method, Comm.basePath + this.url, true);
        this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        if (this.method == "POST") {
            this.xhr.send(formData);
        } else if (this.method == "GET") {
            this.xhr.send();
        } else if (this.method == "PUT") {
            this.xhr.setRequestHeader("Content-Type", "application/json");
            this.xhr.send(JSON.stringify(data));
        }

        return this.xhr;
    }

    public static __preparePromise(method: string, url: string, data: any, callback: IResponseCallback): Promise<any> {
        return new Promise((resolve, reject) => {
            const comm = new Comm(url, method);
            if (callback) {
                comm.on(CommEvents.SUCCESS, callback);
            }
            comm.on(CommEvents.SUCCESS, (response: any) => resolve(response));

            comm.on(CommEvents.VALIDATION_ERRORS, (response: any) => reject(response));
            comm.on(CommEvents.CONNECTION_ERROR, (response: any) => reject(response));
            comm.on(CommEvents.ERROR, (response: any) => reject(response));

            comm.setData(data);
            comm.send();
        });
    }

    public static _post(url: string, data = {}, callback: IResponseCallback = null): Promise<any> {
        return Comm.__preparePromise("POST", url, data, callback);
    }

    public static _get(url: string, data = {}, callback: IResponseCallback = null): Promise<any> {
        return Comm.__preparePromise("GET", url, data, callback);
    }

    public static _put(url: string, data = {}, callback: IResponseCallback = null): Promise<any> {
        return Comm.__preparePromise("PUT", url, data, callback);
    }
}

export { Comm };
