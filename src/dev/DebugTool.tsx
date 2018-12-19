import * as React from "react";

import { TabPane, Tabs } from "../ctrl/Tabs";
import JSONTree from "react-json-tree";
import { Modal } from "../ctrl/Overlays";
import ErrorReporter from "../lib/ErrorReporter";
import Icon from "frontend/src/ctrl/Icon";
import Comm from "frontend/src/lib/Comm";
import { DevProperties } from "./DevProperties";
import { Copyable } from "frontend/src/ctrl/Copyable";
import * as ViewsRoute from "../../../../build/js/tmp/components-route.include.js";
import { ideConnector } from "./IDEConnector";
import { BackofficeStore } from "../backoffice/BackofficeStore";
import { RouteVisualization } from "./RouteVisualization";
import PrintJSON from "../utils/PrintJSON";

declare var DEV_PROPERIES: DevProperties;

interface IDebugToolProps {
    props: any;
    store: any;
    log: any;
    propsReloadHandler: any;
    error?: any;
    componentInfo: any;
}

interface IDebugToolState {
    debugData: { views: Frontend.Debug.DebugDataEntry[]; ajax: Frontend.Debug.DebugDataEntry[] };
    expanded: boolean;
    errors: any[];
    lastError: any;
    isRoutePanelVisible: boolean;
    openedAjaxData: number[];
    openedViewData: number[];
}

//todo js -> ts
export class DebugTool extends React.Component<IDebugToolProps, IDebugToolState> {
    private listeners: any;
    private dragTimeout: any;
    private errorModal: any;

    constructor(props) {
        super(props);
        let savedData = window.localStorage.DebugToolData || false;
        if (savedData) {
            savedData = JSON.parse(savedData);
        }

        this.state = {
            expanded: savedData.expanded,
            errors: [],

            lastError: props.error,
            openedAjaxData: [],
            openedViewData: [],

            debugData: { views: [], ajax: [] },
            isRoutePanelVisible: false,

            style: {
                left: savedData.left,
                top: savedData.top,
            },
        };

        window.onerror = (messageOrEvent, source, lineno, colno, error) => {
            this.state.errors.push(messageOrEvent);
            this.setState({ lastError: error });
            this.forceUpdate();
        };

        this.listeners = {
            _mouseMove: this._mouseMove.bind(this),
            _end: this._end.bind(this),
        };
        this.dragTimeout = null;

        BackofficeStore.registerDebugDataListener(this.debugDataListener);
    }

    private debugDataListener = (debugData: { views: Frontend.Debug.DebugDataEntry[]; ajax: Frontend.Debug.DebugDataEntry[] }) => {
        this.setState({ debugData });
    };

    public routeReloadHandler(): any {
        ideConnector.refreshRoute();
    }





    public handleExpand() {
        this.setState({ expanded: !this.state.expanded }, this.saveData);
    }

    public _mouseMove(e) {
        this.setState({ style: { left: e.clientX + 5, top: e.clientY - 5, right: "auto" } });
    }

    public _drag(e) {
        e.preventDefault();
        this.dragTimeout = setTimeout(() => {
            document.addEventListener("mousemove", this.listeners._mouseMove);
            document.addEventListener("mouseup", this.listeners._end);
        }, 300);
    }

    public _end() {
        document.removeEventListener("mousemove", this.listeners._mouseMove);
        document.removeEventListener("mouseup", this.listeners._end);
        this.saveData();
    }

    private swithAjaxDataVisible = (index) => {
        if (this.state.openedAjaxData.includes(index)) {
            this.setState({ openedAjaxData: this.state.openedAjaxData.filter((el) => el != index) });
        } else {
            this.setState({ openedAjaxData: this.state.openedAjaxData.concat(index) });
        }
    };
    private swithViewDataVisible = (index) => {
        if (this.state.openedViewData.includes(index)) {
            this.setState({ openedViewData: this.state.openedViewData.filter((el) => el != index) });
        } else {
            this.setState({ openedViewData: this.state.openedViewData.concat(index) });
        }
    };

    public saveData() {
        window.localStorage.DebugToolData = JSON.stringify({
            expanded: this.state.expanded,
            left: this.state.style.left,
            top: this.state.style.top,
            selectedTab: this.state.currTab,
        });
    }

    public render() {
        const s = this.state;

        const { componentInfo } = this.props;

        const extendedInfo = componentInfo ? componentInfo.extendedInfo : null;

        return (
            <div className={"w-debug-tool"} tabIndex={1} style={this.state.style}>
                <div className="main-icon" onClick={this.handleExpand.bind(this)} onMouseDown={this._drag.bind(this)} onMouseUp={() => clearTimeout(this.dragTimeout)}>
                    <Icon name={"Edit"}/>
                </div>

                {s.expanded && (
                    <div className="expanded">
                        <div className="toolbar btn-toolbar">
                            <a onClick={() => this.setState({ isRoutePanelVisible: true, expanded: false })} className="btn btn-sm btn-default">
                                <Icon name={"CustomList"}/> Show routes
                            </a>

                            <a onClick={() => this.routeReloadHandler()} className="btn btn-sm btn-default">
                                <Icon name={"Sync"}/> Reload route
                            </a>

                            <a onClick={() => this.props.propsReloadHandler()} className="btn btn-sm btn-default">
                                <Icon name={"Sync"}/> Reload props
                            </a>
                        </div>
                        {/*<Body props={this.props.props} errors={this.state.errors} currTab={this.state.currTab} onTabChange={(index) => this.setState({currTab: index})} routeInfo={extendedInfo}/>*/}

                        <div>
                            <div className={"section-title"}>Views:</div>
                            <div className={"section"}>
                                {this.state.debugData.views.map((info, index) => {

                                    return (
                                        <div key={info.routeInfo._routePath}>
                                            {info.routeInfo._routePath}
                                            {info.instances > 1 && <> ({info.instances})</>}
                                            <a onClick={() => ideConnector.openFile(info.routeInfo._debug.file, info.routeInfo._debug.line)} className="btn btn-default btn-sm">
                                                <Icon name={"FileCode"}/> .php
                                            </a>
                                            <a onClick={() => ideConnector.openFile(info.routeInfo._debug.template + ".component.tsx&line", 1)} className="btn btn-default btn-sm">
                                                <Icon name={"Code"}/> .tsx
                                            </a>

                                            <a onClick={() => this.swithViewDataVisible(index)} className="btn btn-default btn-sm">
                                                <Icon name={"Database"}/> props
                                            </a>
                                            {this.state.openedViewData.includes(index) && (
                                                <div style={{ maxWidth: "600px", overflow: "auto", clear: "both" }}>
                                                    <div style={{ maxHeight: 300, overflow: "auto" }}>
                                                        <PrintJSON json={info.props[0]}/>
                                                     </div>
                                                </div>
                                            )}


                                        </div>
                                    );
                                })}
                            </div>

                            <div className={"section-title"}>API Call:</div>
                            <div className={"section"}>
                                {this.state.debugData.ajax.map((info, index) => {


                                    return (
                                        <div key={info.routeInfo._routePath}>
                                            {info.urls[0]}

                                            <a onClick={() => ideConnector.openFile(info.routeInfo._debug.file, info.routeInfo._debug.line)} className="btn btn-default btn-sm">
                                                <Icon name={"FileCode"}/> .php
                                            </a>
                                            <a onClick={() => this.swithAjaxDataVisible(index)} className="btn btn-default btn-sm">
                                                <Icon name={"Database"}/> data
                                            </a>

                                            {this.state.openedAjaxData.includes(index) && (
                                                <div>
                                                    <pre style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(info.props[0], null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                <Modal show={this.state.lastError != null} onHide={() => this.setState({ lastError: null })} ref={(modal) => (this.errorModal = modal)}>
                    <div style={{ maxWidth: 800 }}>
                        <ErrorReporter error={this.state.lastError}/>
                    </div>
                </Modal>
                {this.state.isRoutePanelVisible && (
                    <Modal show={this.state.isRoutePanelVisible} title={"Routes"} showHideLink={true} onHide={() => this.setState({ isRoutePanelVisible: false })}>
                        <div style={{ width: "90vw" }}>
                            <RouteVisualization/>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }


}

class Body extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    private arrangeIntoTree(paths) {
        const tree = [];

        paths.forEach((path) => {
            const pathParts = path.split("/");
            pathParts.shift(); // Remove first blank element from the parts array.

            let currentLevel = tree; // initialize currentLevel to root

            pathParts.forEach((part) => {
                // check to see if the path already exists.
                const existingPath = currentLevel.filter((level) => level.name === part);

                if (existingPath.length > 0) {
                    // The path to this item was already in the tree, so don't add it again.
                    // Set the current level to this path's children
                    currentLevel = existingPath[0].children;
                } else {
                    const newPart = {
                        name: part,
                        path: pathParts[pathParts.length - 1] == part ? path : "",
                        children: [],
                        isDir: true, //path.file.dir
                    };

                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            });
        });

        return tree;
    }

    public render() {
        const p: any = this.props;

        const componentProps = {};
        const debug = {};

        return (
            <div>
                <Tabs defaultActiveTab={p.currTab} onTabChange={p.onTabChange}>
                    <TabPane title={"Views"} badge={Object.entries(p.props).length} icon="bars">
                        <div className="props">
                            <JSONTree data={componentProps} hideRoot={true} invertTheme={true}/>
                        </div>
                    </TabPane>
                    <TabPane title={"Ajax"} badge={Object.entries(p.props).length} icon="bars">
                        <div>xx</div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

