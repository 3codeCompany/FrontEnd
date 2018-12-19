import Comm from "../lib/Comm";
import Router from "frontend/src/backoffice/Router";
import * as qs from "qs";
import BackOfficePanel from "./BackOfficePanel";
import {hot} from "react-hot-loader";

declare var window;
declare var module;

const browserInput = window.reactBackOfficeVar;

export class BackofficeStore {
    public static debugData: { views: Frontend.Debug.DebugDataEntry[]; ajax: Frontend.Debug.DebugDataEntry[] } = {views: [], ajax: []};
    public static debugDataListeners: Frontend.Debug.DebugDataListener[] = [];
    public static debugViewAjaxInProgress = true;
    public static registerDebugDataListener = (listener: Frontend.Debug.DebugDataListener) => {
        BackofficeStore.debugDataListeners.push(listener);
    };

    public static debugDataChanged() {
        for (const listener of BackofficeStore.debugDataListeners) {
            listener(this.debugData);
        }
    }

    public static registerDebugData(type: string, url: string, routeInfo: Frontend.Debug.RouteInfo, props) {

        if (type == "ajax") {
            for (const index in BackofficeStore.debugData.ajax) {
                const entry = BackofficeStore.debugData.ajax[index];
                if (entry.route == routeInfo._routePath) {
                    BackofficeStore.debugData.ajax.splice(index, 1);
                }
            }

            BackofficeStore.debugData[type].push({
                urls: [url],
                props: [props],
                route: routeInfo._routePath,
                routeInfo,
                instances: 1,
            });
            if (BackofficeStore.debugData[type].length > 10) {
                BackofficeStore.debugData[type] = BackofficeStore.debugData[type].slice(-10);
            }
        } else {
            let exists = false;
            for (const entry of BackofficeStore.debugData[type]) {
                if (entry.route == routeInfo._routePath) {
                    exists = true;
                    entry.urls.push(url);
                    entry.props.push(props);
                    entry.instances++;
                }
            }
            if (!exists) {
                BackofficeStore.debugData[type].push({
                    urls: [url],
                    props: [props],
                    route: routeInfo._routePath,
                    routeInfo,
                    instances: 1,
                });
            }
        }

        BackofficeStore.debugDataChanged();
    }

    public static unregisterDebugData(url, props) {
        for (const index in BackofficeStore.debugData.views) {
            const entry = BackofficeStore.debugData.views[index];
            for (let i = entry.urls.length - 1; i >= 0; i--) {
                if (entry.urls[i] == url) {
                    entry.instances--;
                    if (entry.instances == 0) {
                        BackofficeStore.debugData.views.splice(index, 1);
                        break;
                    }

                    entry.urls.splice(i, 1);
                    entry.props.splice(i, 1);
                }
            }
        }
        BackofficeStore.debugDataChanged();
    }

    public dataUpdateCb: () => any;

    public subStore = false;
    // input added to view request
    public viewInput = {};
    public basePath = browserInput.basePath;

    public isViewLoading = true;
    public isPackageCompiling = false;

    public viewServerErrors = null;
    public view: any = null;
    public viewData: any = {};
    public externalViewData: any = {};

    private onViewLoadArr = [];
    private onViewLoadedArr = [];

    public initRootElement() {
        if (window.location.hash != "#" && window.location.hash) {
            this.changeView(window.location.hash.replace("#", ""));
        } else {
            const path = window.location.pathname;
            this.changeView(path.replace(browserInput.basePath, ""));
        }
        window.addEventListener("hashchange", this.hashChangeHandler, false);

        Comm.errorFallback = (error) => {
            this.viewServerErrors = error;
            this.dataUpdated();
        };

        Comm.onStart.push((url, data, method) => {
            if (!BackofficeStore.debugViewAjaxInProgress) {
                const routeData = Router.getRouteInfo(url);
                if (routeData !== null) {
                    BackofficeStore.registerDebugData("ajax", url, Router.getRouteInfo(url), data);
                }
            }
        });

        if (module.hot) {
            module.hot.addStatusHandler((status) => {
                if (status == "check") {
                    this.isPackageCompiling = true;
                    this.dataUpdated();
                } else if (status == "idle") {
                    this.isPackageCompiling = false;
                    this.dataUpdated();
                }
            });
        }
    }

    public getState() {
        return {
            basePath: this.basePath,
            viewInput: this.viewInput,
            view: this.view,
            viewData: this.viewData,
            viewServerErrors: this.viewServerErrors,
            isViewLoading: this.isViewLoading,
            isPackageCompiling: this.isPackageCompiling,
        };
    }

    public onDataUpdated(cb) {
        this.dataUpdateCb = cb;
    }

    public dataUpdated() {
        if (this.dataUpdateCb !== undefined) {
            this.dataUpdateCb();
        }
    }

    public hashChangeHandler = () => {
        if (window.location.hash != "#") {
            this.changeView(window.location.hash.replace("#", ""));
        }
    };

    private currentPath = "";
    public changeView = (path: string, input = null, callback: () => any = null) => {
        const originalPath = path;

        try {
            this.isViewLoading = true;
            this.viewServerErrors = null;

            // for just reloading props
            if (path == null) {
                if (!this.subStore) {
                    if (window.location.hash != "#") {
                        path = window.location.hash.replace("#", "");
                    } else {
                        const [base, query] = window.location.href.split("?");
                        path = window.location.pathname.replace(browserInput.basePath, "") + (query ? "?" + query : "");
                    }
                } else {
                    path = this.currentPath;
                }
            }
            this.currentPath = path;

            let url = "";
            let view: any;
            // check path contains query string
            if (path.indexOf("?") == -1) {
                view = Router.resolve(path);
                const query = qs.stringify(input);
                url = path + (query ? "?" + query : "");
            } else {
                const [purePath, pathQueryString] = path.split("?");
                view = Router.resolve(purePath);
                const partOfInput = qs.parse(pathQueryString);
                const query = qs.stringify(Object.assign({}, partOfInput, input));
                url = purePath + (query ? "?" + query : "");
            }

            view.then((view) => {

                if (!this.subStore) {
                    window.removeEventListener("hashchange", this.hashChangeHandler);
                    window.location.hash = url;
                    setTimeout(() => window.addEventListener("hashchange", this.hashChangeHandler), 20);
                }

                const comm = new Comm(url);

                comm.setData({__PROPS_REQUEST__: 1});
                comm.on(Comm.EVENTS.ERROR, (errorResponse) => {
                    this.viewServerErrors = errorResponse;
                    for (const el of this.onViewLoadedArr) {
                        el();
                    }
                });
                comm.on(Comm.EVENTS.SUCCESS, (data) => {
                    if (data.__arrowException !== undefined) {
                        this.viewServerErrors = data;
                        this.isViewLoading = false;
                        return;
                    }

                    this.viewData = Object.assign({}, data, this.externalViewData);
                    this.view = view;

                    for (const el of this.onViewLoadedArr) {
                        el();
                    }
                    if (callback) {
                        callback();
                    }

                    if (originalPath) {
                        try {
                            Router.getRouteInfo(originalPath).then((routeData: Frontend.Debug.RouteInfo) => {
                                BackofficeStore.registerDebugData("views", originalPath, routeData, this.viewData);
                            });

                        } catch (e) {
                            console.error("cos jest ni tak " + originalPath + " " + e);
                        }
                    }
                });
                comm.on(Comm.EVENTS.FINISH, () => {
                    this.isViewLoading = false;
                    this.dataUpdated();
                });

                BackofficeStore.debugViewAjaxInProgress = true;
                comm.send();
                BackofficeStore.debugViewAjaxInProgress = false;

            });

        } catch (e) {

            this.viewServerErrors = e;
            this.view = null;
            this.isViewLoading = false;
            this.dataUpdated();
        }
    };

    public onViewLoad = (callback) => {
        this.onViewLoadArr.push(callback);
    };

    public onViewLoaded = (callback) => {
        this.onViewLoadedArr.push(callback);
    };
}
