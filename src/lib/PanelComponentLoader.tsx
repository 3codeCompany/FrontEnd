import * as NotificationSystem from "react-notification-system";
//import * as Notifications from "react-notification-system";
import {toJS} from "mobx";
import * as React from "react";


import {observer} from "mobx-react";
import {Copyable} from "frontend/src/ctrl/Copyable";
import Router from "frontend/src/backoffice/Router";

declare var PRODUCTION: boolean;
declare var window: any;

//console.log(Views);

let exampleComponent = `import * as React from "react";
import {IArrowViewComponentProps} from "frontend/src/lib/PanelComponentLoader";

import Navbar from "frontend/src/ctrl/Navbar";

interface IProps extends IArrowViewComponentProps {
}

export default class ArrowViewComponent extends React.Component<IProps, any> {
    public render() {
        return (
            <div>
                <Navbar>
                    <span>Path</span>
                </Navbar>
                <div>
                    <div className="panel-body-margins">
                        Content
                    </div>
                </div>
            </div>
        );
    }
}`;


export interface IArrowViewComponentProps {
    /**
     * Url without last action part
     */
    baseURL: string;
    /**
     * Display panel notification
     * @param {string} content Notification content
     * @param {string} title Notification title
     * @param {Object} conf Config object
     * @returns {any}
     * @private
     */
    _notification: { (content: string, title?: string, conf?: NotificationSystem.Notification): any };
    _reloadProps: { (args?: any, callback?: { (): any }): any };
    _goto: { (componentPath: string, args?: any): any };
    _log: { (element: any): any };
    _resolveComponent: { (componentPath: string): React.ReactElement<any> }
    _startLoadingIndicator: { (): any };
    _stopLoadingIndicator: { (): any };
}

interface IProps {
    store: any;
    onLoadStart?: { (): any };
    onLoadEnd?: { (): any };
}

interface IState {
    log: Array<any>
    debugToolLoaded: boolean,
    hasError: boolean,
    error: any,
    devComponentFile: string,
}

@observer
export default class PanelComponentLoader extends React.Component<IProps, IState> {

    _notificationSystem: any;
    DebugTool: any = null;
    private baseURL: string;

    constructor(props) {
        super(props);
        this.state = {
            log: [],
            debugToolLoaded: false,
            hasError: false,
            error: false,
            devComponentFile: null,
        }

    }

    componentDidCatch(error, info) {
        // Display fallback UI
        if (!PRODUCTION) {

        }
        this.setState({hasError: true, error: error});
        // You can also log the error to an error reporting service
        //logErrorToMyService(error, info);
    }

    componentWillMount() {
        if (!PRODUCTION) {
            import
                ( /* webpackChunkName = "DebugTool" */ '../utils/DebugTool').then(({DebugTool}) => {
                this.DebugTool = DebugTool;
                this.setState({debugToolLoaded: true});

            });


        }
    }

    getComponentInfo(path) {
        return Router.resolve(path);
    }

    componentWillReact() {
        let {store} = this.props;

        if (store.viewComponentName) {
            let component = this.getComponentInfo(store.viewComponentName);
            if (!component) {
                if (!PRODUCTION) {
                    this.setState({devComponentFile: null});
                    console.error(`Can't find component file for: "${store.viewComponentName}"`);
                }
            }
        }


    }


    handleReloadProps(input = {}, callback: () => any) {
        this.props.onLoadStart();
        this.props.store.changeView(null, input, () => {
            this.props.onLoadEnd();
            callback();
        });
    }


    handleGoTo(path, input = {}) {
        this.props.store.changeView(path, input);

    }

    handleResolveComponent(path) {
        alert('Resolving component ' + path);

    }

    handleNotifycation(message, title = '', options = {}) {
        let data = {title: title, message: message, ...{level: 'success', ...options}};

        this._notificationSystem.addNotification(data);

    }

    handleLog(message) {
        this.state.log.push({msg: message});
        this.setState(null);
    }


    render() {
        const s = this.state;
        const p = this.props;
        let ComponentInfo: any = Router.resolve(p.store.viewComponentName);


        let DebugTool = this.DebugTool;
        let debugVar = {
            log: s.log,
            propsReloadHandler: this.handleReloadProps.bind(this),
            componentInfo: ComponentInfo,
            props: p.store.viewData,
            store: p.store
        };

        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div>
                <h1>Something went wrong.</h1>
                {!PRODUCTION && this.state.debugToolLoaded && <DebugTool error={this.state.error}  {...debugVar} />}

            </div>;
        }

        let notificaton = {
            ref: (ns) => this._notificationSystem = ns
        }

        return <div className={ComponentInfo.extendedInfo.component}>

            {!PRODUCTION && this.state.debugToolLoaded && <DebugTool {...debugVar} />}

            <NotificationSystem {...notificaton} />
            {this.props.store.viewServerErrors != null && <div>
                <div style={{padding: 10, backgroundColor: 'white', margin: 15}} dangerouslySetInnerHTML={{__html: this.props.store.viewServerErrors}}/>
            </div>}


            {ComponentInfo && <ComponentInfo.Component
                {...toJS(p.store.viewData)}
                reloadProps={this.handleReloadProps.bind(this)}
                baseURL={this.baseURL ? this.baseURL : p.store.viewData.baseURL}
                _notification={this.handleNotifycation.bind(this)}
                _log={this.handleLog.bind(this)}
                _reloadProps={this.handleReloadProps.bind(this)}
                _goto={this.handleGoTo.bind(this)}
                _resolveComponent={this.handleReloadProps.bind(this)}
                _startLoadingIndicator={this.props.onLoadStart}
                _stopLoadingIndicator={this.props.onLoadEnd}
                _scrollTo={(el) => {

                }}
            />}

            {(ComponentInfo == false && p.store.viewComponentName != null) && <div style={{padding: 10}}>
                <h3>Can't find component </h3>
                <pre>Route: "{p.store.viewComponentName}"</pre>
                <pre>Component file: <a href={`phpstorm://open?url=file://${this.state.devComponentFile}&line=1`}>{this.state.devComponentFile}</a></pre>
                <Copyable>
                    <pre style={{backgroundColor: 'white', padding: 10, border: 'solid 1px grey', fontSize: 11}}>{exampleComponent}</pre>
                </Copyable>
            </div>}

            {p.store.viewComponentName == null && <div>Loading...</div>}


        </div>

    }
}

class ErrorReporterLoader extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            component: null
        }
    }

    componentDidMount() {
        import
            ("./ErrorReporter").then((Reporter) => {
            this.setState({loaded: true, component: Reporter.default});
        });
    }


    render() {
        if (!this.state.loaded) {
            return <div>Loading ...</div>
        } else {
            let Component = this.state.component;
            return <Component error={this.props.error}/>
        }
    }
}

