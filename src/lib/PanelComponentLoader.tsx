import * as NotificationSystem from "react-notification-system";
import * as React from "react";

import {IModalProps} from "../ctrl/Overlays";
import RouterException from "../backoffice/RouterException";
import {RouteVisualization} from "../dev/RouteVisualization";
import {ServerErrorPresenter} from "../dev/ServerErrorPresenter";

declare var PRODUCTION: boolean;
declare var window: any;


export interface IArrowViewComponentProps {
    /**
     * Url without last action part
     */

    _baseURL: string;

    _basePath: string;

    /**
     * Display panel notification
     * @param {string} content Notification content
     * @param {string} title Notification title
     * @param {Object} conf Config object
     * @returns {any}
     * @private
     */
    _notification(content: string, title?: string, conf?: NotificationSystem.Notification): any;

    _reloadProps(args?: any, callback?: () => any): any;

    _setPanelOption(name: string, value: string | number | boolean, callback?: () => any): any;

    _goto(componentPath: string, args?: any, callback?: () => any): any;

    _log(element: any): any;

    _startLoadingIndicator(): any;

    _stopLoadingIndicator(): any;

    _isSub: boolean;

    _openModal(route: string, input?: any, modalProps?: Partial<IModalProps>, props?: any): string;

    _closeModal( modalId: string ): any;
}

interface IProps {
    context: any;
    isSub: boolean;

    onLoadStart(): any;

    onLoadEnd(): any;

    setPanelOption(name: string, value: string | number | boolean, callback?: () => any): any;

    openModal(route: string, input?: any, modalProps?: Partial<IModalProps>, props?: any): any;

    closeModal(modalId: string): any;
}

interface IState {
    log: any[];
    debugToolLoaded: boolean;
    hasError: boolean;
    error: any;
    devComponentFile: string;
}

export default class PanelComponentLoader extends React.Component<IProps, IState> {
    public notificationSystem: NotificationSystem.System;
    public DebugTool: any = null;

    constructor(props) {
        super(props);
        this.state = {
            log: [],
            debugToolLoaded: false,
            hasError: false,
            error: false,
            devComponentFile: null,
        };
    }

    public componentDidCatch(error, info) {
        // Display fallback UI
        /*if (!PRODUCTION) {
        }*/
        this.setState({hasError: true, error});
        // You can also log the error to an error reporting service
        // logErrorToMyService(error, info);
    }

    public componentWillMount() {
        if (!PRODUCTION) {
            import(/* webpackChunkName = "DebugTool" */ "../dev/DebugTool").then(({DebugTool}) => {
                this.DebugTool = DebugTool;
                this.setState({debugToolLoaded: true});
            });
        }
    }

    public handleReloadProps = (input = {}, callback: () => any) => {
        this.props.changeView(input, callback);
    };

    public handleGoTo = (path, input = {}, callback = null) => {
        this.props.context.changeView(path, input, callback);
    };

    public handleNotification = (message, title = "", options: Partial<NotificationSystem.Notification> = {}) => {
        const data: NotificationSystem.Notification = {title, message, ...{level: "success", ...options}};
        this.notificationSystem.addNotification(data);
    };

    public handleLog = (message) => {
        this.state.log.push({msg: message});
        this.setState(null);
    };

    public render() {
        const s = this.state;
        const p = this.props;
        const ComponentInfo: any = p.context.view;

        const DebugTool = this.DebugTool;
        const debugVar: any = {
            log: s.log,
            propsReloadHandler: this.handleReloadProps.bind(this),
            componentInfo: ComponentInfo,
            props: p.context.viewData,
            store: p.context,
        };

        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    {!PRODUCTION && this.state.debugToolLoaded && <DebugTool error={this.state.error} {...debugVar} />}
                </div>
            );
        }

        return (
            <div className={ComponentInfo && ComponentInfo.extendedInfo.component}>
                {!PRODUCTION && this.props.isSub == false && this.state.debugToolLoaded && <DebugTool {...debugVar} />}

                <NotificationSystem ref={(ns) => (this.notificationSystem = ns)}/>
                {this.props.context.viewServerErrors && <ServerErrorPresenter error={this.props.context.viewServerErrors} />}

                {ComponentInfo && ComponentInfo.Component ? (
                    <ComponentInfo.Component
                        {...p.context.viewData}
                        reloadProps={this.handleReloadProps}
                        baseURL={p.context.view.baseURL}
                        _baseURL={p.context.view.baseURL}
                        _basePath={p.context.basePath}
                        _notification={this.handleNotification}
                        _log={this.handleLog}
                        _reloadProps={this.handleReloadProps}
                        _setPanelOption={this.props.setPanelOption}
                        _goto={this.handleGoTo}
                        _startLoadingIndicator={this.props.onLoadStart}
                        _stopLoadingIndicator={this.props.onLoadEnd}
                        _isSub={this.props.isSub}
                        _scrollTo={(el) => {
                            alert("Not implemented");
                        }}
                        _openModal={this.props.openModal}
                        _closeModal={this.props.closeModal}
                    />
                ) : (
                    !this.props.context.isViewLoading && (
                        (this.props.context.viewServerErrors && this.props.context.viewServerErrors.__arrowException === undefined) || !this.props.context.viewServerErrors) && (
                        <div style={{padding: 20}}>
                            <h1>404 not found</h1>
                            <div>Selected resource cannot be found</div>
                        </div>
                    )
                )}

                {ComponentInfo &&
                ComponentInfo.Component == null && (
                    <div style={{padding: 10}}>
                        <h3>Can't find component </h3>
                        <pre>{JSON.stringify(ComponentInfo, null, 2)}</pre>
                    </div>
                )}
            </div>
        );
    }
}

class ErrorReporterLoader extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            component: null,
        };
    }

    public componentDidMount() {
        import("./ErrorReporter").then((Reporter) => {
            this.setState({loaded: true, component: Reporter.default});
        });
    }

    public render() {
        if (!this.state.loaded) {
            return <div>Loading ...</div>;
        } else {
            const Component = this.state.component;
            return <Component error={this.props.error}/>;
        }
    }
}
