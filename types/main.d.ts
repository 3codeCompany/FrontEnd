import * as React from "react";

declare global {
    declare namespace Frontend {
        declare namespace Debug {
            export interface RouteInfo {
                _controller: string;
                _method: string;
                _package: string;
                _routePath: string;
                _baseRoutePath: string;
                _debug: {
                    file: string;
                    line: string;
                    template: string;
                    templateExists: boolean;
                    componentExists: boolean;
                };
            }

            export interface DebugDataEntry {
                route: string;
                props: any[];
                urls: any[];
                instances: number;
                routeInfo: RouteInfo;
            }

            export type DebugDataListener = (data: DebugDataEntry[]) => any;
        }
    }
}
