type IResponseCallback = (response: any) => any;

declare var PRODUCTION: any;
declare var DEV_PROPERIES: any;

class Comm {

    public static basePath = "";
    public static errorFallback = null;

    public static onStart = null;
    public static onFinish = null;

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

    private registredEvents: any;
    private method: string;
    private url: string;
    private data: any;
    private namespace: string;
    private xhr: XMLHttpRequest;

    constructor(url, method = "POST") {

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

    public on(event: string, callback: IResponseCallback) {
        if (!Array.isArray(this.registredEvents[event])) {
            console.error("Unknow event: " + event);
            console.log(this.registredEvents);
        } else {
            this.registredEvents[event].push(callback);
        }
    }

    public callEvent(event, data) {
        this.registredEvents[event].map((el) => el(data));
    }

    public setData(data) {
        this.data = data;
    }

    public appendFormData(FormData: FormData, data, name = "") {

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

            Object.entries(data).map(([index, value]) => {
                if (name == "") {
                    this.appendFormData(FormData, value, index);
                } else {
                    //test for array in field name
                    const openBracket = index.indexOf("[");
                    let newName = name + "[" + index + "]";
                    if (openBracket != -1) {
                        newName = name + "[" + index.slice(0, openBracket) + "]" + index.slice(openBracket);
                    }
                    this.appendFormData(FormData, value, newName);
                }
            });
        } else {
            //if (data && data != null) {
            FormData.append(name, data == null ? "" : data);
            //}
        }
    }

    public prepareData() {
        let data = {};
        if (this.namespace) {
            data[this.namespace] = this.data;
        } else {
            data = this.data;
        }
        return data;
    }

    public debugError(error) {
        if (Comm.errorFallback) {
            Comm.errorFallback(
                {
                    url: Comm.basePath + this.url,
                    input: this.data,
                    response: error,
                },
            );
        } else {
            const errorWindow = window.open("", "", "width=800,height=600");
            errorWindow.document.write("<pre>" + error + "</pre>");
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
        const formData = new FormData();
        if (this.method == "POST") {
            this.appendFormData(formData, data);
        }

        this.callEvent(Comm.EVENTS.BEFORE_SEND, data);

        this.xhr = new XMLHttpRequest();

        this.xhr.upload.onprogress = (event) => {
            this.callEvent(Comm.EVENTS.PROGRESS, {
                loaded: event.loaded,
                percent: Math.round(event.loaded / event.total * 100),
            });
        };

        this.xhr.onreadystatechange = () => {
            if (!PRODUCTION) {
                if (this.xhr.readyState == this.xhr.HEADERS_RECEIVED) {
                    const hash = this.xhr.getResponseHeader("ARROW_DEBUG_ROUTE_HASH");

                    const checkCompilationInProgress = (cbNotInCompilation) => {
                        const url2 = new URL(JSON.parse(DEV_PROPERIES.build_domain) + "isCompilationInProgress");

                        fetch(url2.toString()).then((response) => {
                            return response.json();
                        }).then((response) => {
                            if (response.result) {
                                console.log("still in compilation ");
                                setTimeout(() => {
                                    checkCompilationInProgress(cbNotInCompilation);
                                }, 100);

                            } else {
                                cbNotInCompilation();
                                console.log("not in compilation");
                            }
                        });
                    };

                    if (hash != null) {
                        console.log(hash, "compilation hash");
                        const location = window.location.protocol + "//" + window.location.host + Comm.basePath;
                        const url = new URL(JSON.parse(DEV_PROPERIES.build_domain) + "refreshRoute");
                        const params = {location, hash};
                        Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

                        fetch(url.toString()).then((response) => {
                            response.json().then((response) => {
                                if (response.result == 1) {
                                    //alert("Wait for webpack recompilation  " + JSON.stringify(response));
                                    setTimeout(() => {
                                        let inCompilation;
                                        checkCompilationInProgress(() => {
                                            alert("Route change detected. Application will restart");
                                            window.location.reload();
                                        });
                                    }, 200);

                                } else {
                                }
                            });
                        });
                    }
                }
            }

            if (this.xhr.readyState === 4) {
                if (this.xhr.status === 200) {
                    let exceptionOccured = false;
                    let data;
                    try {
                        this.callEvent(Comm.EVENTS.RESPONSE, this.xhr.response);
                        data = JSON.parse(this.xhr.response);
                    } catch (e) {
                        exceptionOccured = true;
                        if (this.registredEvents.error.length == 0) {

                            this.debugError(e.message + "<hr />" + this.xhr.response);
                        } else {
                            if (this.debug) {
                                this.debugError(e.message + "<hr />" + this.xhr.response);
                            }
                            this.callEvent(Comm.EVENTS.ERROR, this.xhr.response);
                        }

                    }

                    if (!exceptionOccured) {
                        if (data.errors === undefined && data.accessDeny === undefined) {
                            this.callEvent(Comm.EVENTS.SUCCESS, data);
                        } else if (data.accessDeny !== undefined) {
                            alert("Access deny " + data.accessDeny);
                        } else {
                            this.callEvent(Comm.EVENTS.VALIDATION_ERRORS, data);
                        }
                    }

                } else {
                    // 0 == abotreted
                    if (this.xhr.status != 0) {
                        this.debugError(this.xhr.status + "<hr />");
                        this.callEvent(Comm.EVENTS.CONNECTION_ERROR, this.xhr.response);
                    }
                }
                this.callEvent(Comm.EVENTS.FINISH, this.xhr);
                if (Comm.onFinish) {
                    Comm.onFinish();
                }
            }
        };

        if (Comm.onStart) {
            Comm.onStart();
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

    public static __preparePromise(method, url, data, callback): Promise<any> {
        return new Promise((resolve, reject) => {
            const comm = new Comm(url);
            comm.method = method;
            if (callback) {
                comm.on("success", callback);
            }
            comm.on("success", (data) => resolve(data));

            comm.on("validationErrors", (data) => reject(data));
            comm.on("connectionError", (data) => reject(data));
            comm.on("error", (data) => reject(data));

            comm.setData(data);
            comm.send();

        });
    }

    public static _post(url, data = {}, callback = null): Promise<any> {
        return Comm.__preparePromise("POST", url, data, callback);
    }

    public static _get(url, data = {}, callback = null): Promise<any> {
        return Comm.__preparePromise("GET", url, data, callback);
    }

    public static _put(url, data = {}, callback = null): Promise<any> {
        return Comm.__preparePromise("PUT", url, data, callback);
    }
}

export default Comm;

export {Comm};
