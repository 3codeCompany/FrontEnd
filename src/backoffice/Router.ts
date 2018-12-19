// declare var Views: any;
import * as ViewsRoute from "../../../../build/js/tmp/components-route.include.js";
import RouterException from "./RouterException";

declare var PRODUCTION: any;

class Router {
    public routes = ViewsRoute.ViewFileMap;
    public observers = [];

    constructor() {

    }

    public onRoutesChanges(callback) {
        this.observers.push(callback);
    }

    public getRouting = () => {
        return this.routes;
    };

    public async getRouteInfo(path): Frontend.Debug.RouteInfo {
        if (path.indexOf("?") != -1) {
            const purePath = path.split("?")[0];
            path = purePath;
        }

        try {
            const info = await this.resolve(path);
            return info.extendedInfo;
        } catch (e) {
            console.log(`[RouteInfo] No info for '${path}' found`);
            return null;
        }

    }

    public async resolve(path) {
        const pathInfo = path;
        let Component = null;
        let extendedInfo = null;

        if (!path) {
            return false;
        }

        // dynamic path matching 12
        for (const i in ViewsRoute.ViewFileMap) {
            const el = ViewsRoute.ViewFileMap[i];
            if (i.indexOf("{") != -1) {
                const regexp = new RegExp(
                    "^" +
                    i
                    // repplace all {var} to (.+?)
                        .replace(/\{.+?\}/g, "(.+?)")
                        // replace all / to _
                        .replace(/\//g, "/") +
                    "$",
                );
                if (path.match(regexp) !== null) {
                    let tmp = i.split("/{")[0].split("/");
                    tmp = tmp.slice(0, -1);
                    if (el.component) {
                        if (PRODUCTION) {
                            const result = await ViewsRoute[el.namespace + "_export"]();
                            Component = result[el.index].default;
                        } else {
                            Component = ViewsRoute[el.component];
                        }
                    }
                    extendedInfo = el;
                    break;
                }
            } else {
                if (path == i) {
                    let tmp = i.split("/{")[0].split("/");
                    tmp = tmp.slice(0, -1);
                    if (el.component) {
                        if (PRODUCTION) {
                            const result = await ViewsRoute[el.namespace + "_export"]();
                            Component = result[el.index].default;
                        } else {
                            Component = ViewsRoute[el.component];
                        }
                    }
                    extendedInfo = el;
                    break;
                }
            }
        }

        if (!extendedInfo) {

            throw new RouterException(`Route not found: '${path}'`);
        }

        if (!Component && extendedInfo) {
            console.error("Component file not found:" + pathInfo);
            console.error("Component file should be:" + extendedInfo._debug.template);
        }

        return {
            baseURL: extendedInfo._baseRoutePath,
            path: pathInfo,
            Component,
            extendedInfo,
        };
    }
}

const router = new Router();

if (module.hot) {
    module.hot.accept("../../../../build/js/tmp/components-route.include.js", (module, x) => {
        router.routes = require("../../../../build/js/tmp/components-route.include.js").ViewFileMap;
        for (const cb of router.observers) {
            cb();
        }
    });
}

export default router;
