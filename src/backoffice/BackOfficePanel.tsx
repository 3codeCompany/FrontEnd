import * as React from "react";

import { IMenuElement, IMenuSection, Menu } from "./Menu";

// @ts-ignore
import * as NProgress from "nprogress/nprogress.js";
import "nprogress/nprogress.css";

import { LoadingIndicator } from "../LoadingIndicator";

// @ts-ignore
import Hotkeys from "react-hot-keys";

import { IModalProps, Modal } from "../Modal";
import { Select } from "../fields/Select";
import { fI18n, Comm } from "../lib";
import { Icon } from "../Icon";

import { BackOfficeContainer } from "./BackOfficeContainer";
import { BackofficeStore } from "./BackofficeStore";
import { PanelComponentLoader } from "./PanelComponentLoader";
import { configGetAll } from "./Config";
import { IPanelContext } from "./PanelContext";
import { ICommand } from "../CommandBar";
import "./BackOfficePanel.sass";
import DebugCommLog from "./DebugCommLog";
import IBackOfficeStoreState from "./interfaces/IBackOfficeStoreState";
import { HotKeys, ObserveKeys } from "react-hotkeys";

const DebugTool = React.lazy(() => import("./DebugTool"));
declare var PRODUCTION: boolean;
NProgress.configure({ parent: ".w-panel-body" });

interface IBackOfficePanelProps {
    icon?: string;
    onlyBody?: boolean;
    isSub?: boolean;
    title?: string;
    user?: any;
    menu?: IMenuSection[];
    store?: BackofficeStore;
    parentContext?: IPanelContext;
    topActions?: ICommand[];
}

interface IBackOfficePanelState {
    currentView: string;
    userMenuVisible: boolean;
    menuVisible: boolean;
    layout: "mobile" | "normal" | "large";
    loading: boolean;
    onlyBody: boolean;
    contextState: IBackOfficeStoreState;
    openedWindows: Array<{
        route: string;
        input: any;
        modalProps: any;
        props: any;
    }>;
    navigationWindowOpened: boolean;
}

export class BackOfficePanel extends React.Component<IBackOfficePanelProps, IBackOfficePanelState> {
    public container: HTMLDivElement;
    public store: BackofficeStore;
    private panelLoader = React.createRef<PanelComponentLoader>();

    private callbacks: { onceAfterUpdate: Array<() => any> } = {
        onceAfterUpdate: [],
    };

    public static defaultProps: Partial<IBackOfficePanelProps> = {
        onlyBody: false,
        isSub: false,
        parentContext: null,
        topActions: [],
    };

    constructor(props: IBackOfficePanelProps) {
        super(props);

        this.store = this.props.store ? this.props.store : new BackofficeStore();

        this.state = {
            currentView: null,
            userMenuVisible: false,
            menuVisible: true,
            layout: "normal",
            loading: false,
            onlyBody: this.props.onlyBody,
            contextState: this.store.getState(),
            openedWindows: [],
            navigationWindowOpened: false,
        };

        this.store.onViewLoad(() => this.handleLoadStart());
        this.store.onViewLoaded(() => this.handleLoadEnd());

        Comm.onStart.push(this.handleLoadStart);
        Comm.onFinish.push(this.handleLoadEnd);
    }

    public adjustToSize() {
        if (this.container) {
            this.container.style.height = window.innerHeight + "px";
        }
        if (window.innerWidth <= 479 && this.state.layout != "mobile") {
            this.setState({ layout: "mobile", menuVisible: false });
        } else if (window.innerWidth > 479 && this.state.layout != "normal") {
            this.setState({ layout: "normal", menuVisible: true });
        }
    }

    public handleAppIconClicked = () => {
        if (this.state.layout != "mobile") {
            this.store.changeView("/admin/dashboard");
        } else {
            this.setState({ menuVisible: !this.state.menuVisible });
        }
    };

    public handleNavigateTo = (element: IMenuElement, inWindow = false) => {
        if (inWindow) {
            this.handleOpenWindow(element.route, {}, { title: element.title, showHideLink: true, top: 55 });
        } else {
            this.store.changeView(element.route);
        }
        if (this.state.layout == "mobile") {
            this.setState({ menuVisible: false });
        }
    };

    public getContext = () => {
        return this.panelLoader.current.getContext();
    };

    public handleOpenWindow = (
        route: string,
        input: any = {},
        modalProps: Partial<IModalProps> = {},
        props: any = {},
    ) => {
        modalProps.show = true;
        this.setState({
            openedWindows: this.state.openedWindows.concat({
                route,
                input,
                modalProps,
                props,
            }),
        });

        return route;
    };

    public handleCloseWindow = (route: string): any => {
        const target = this.state.openedWindows.filter((el) => el.route == route);
        if (target.length > 0) {
            if (target[0].modalProps.onHide) {
                target[0].modalProps.onHide();
            }
        }
        this.setState({
            openedWindows: this.state.openedWindows.filter((el) => el.route != route),
        });
    };

    public componentDidMount() {
        this.store.onDataUpdated(() => {
            this.setState({ contextState: this.store.getState() });
        });
        if (!this.props.isSub) {
            this.store.initRootElement();
            this.adjustToSize();
            let timeout = null;
            window.addEventListener("resize", () => {
                // clearTimeout(timeout);
                timeout = setTimeout(this.adjustToSize.bind(this), 30);
            });
        }

        window.addEventListener("keydown", (e) => {
            console.log("tutaj");
            if (document.activeElement.tagName == "BODY") {
                this.container.focus();
                if (e.key == "Escape") {
                    this.hideGlobalMenu(null);
                }
            }
        });
    }

    public componentDidUpdate() {
        for (const callback of this.callbacks.onceAfterUpdate) {
            callback();
        }
        this.callbacks.onceAfterUpdate = [];
    }

    public handleChangeView = (input = {}, callback: () => any) => {
        this.escTarget = null;
        this.handleLoadStart();

        this.store.changeView(null, input, () => {
            this.handleLoadEnd();
            if (callback) {
                // callback have to run after update not when data is recived
                this.callbacks.onceAfterUpdate.push(callback);
            }
        });
    };

    public handleLoadStart = () => {
        NProgress.start();
    };

    public handleLoadEnd = () => {
        NProgress.done();
    };

    public handleSetPanelOption = (name: string, value: any, callback: () => any) => {
        const obj: any = {};
        obj[name] = value;
        this.setState(obj, callback);
    };
    private escTarget: any;

    private hideGlobalMenu = (e: any) => {
        if (e !== null) {
            this.escTarget = e.nativeEvent.target;
        }
        var newState = !this.state.navigationWindowOpened;
        this.setState({ navigationWindowOpened: newState });
        if (!newState && this.escTarget) {
            this.escTarget.focus();
        }
    };

    public render() {
        const languages = configGetAll().translations.languages;
        const { topActions } = this.props;
        return (
            <HotKeys
                handlers={{
                    X: this.hideGlobalMenu,
                }}
                keyMap={{
                    X: "esc",
                }}
            >
                <ObserveKeys only={["esc"]}>
                    <div
                        className="w-panel-container w-backoffice-panel"
                        ref={(container) => (this.container = container)}
                        tabIndex={0}
                    >
                        {!this.state.onlyBody && (
                            <div className="w-panel-top">
                                <div className="app-icon" onClick={this.handleAppIconClicked}>
                                    <i
                                        className={
                                            "ms-Icon ms-Icon--" +
                                            (this.state.layout != "mobile" ? this.props.icon : "CollapseMenu")
                                        }
                                    />
                                </div>
                                <div className="app-title">{this.props.title}</div>

                                {!PRODUCTION && this.props.isSub == false && (
                                    <React.Suspense fallback={<>...</>}>
                                        <DebugTool />
                                    </React.Suspense>
                                )}

                                <div className="app-user" onClick={() => this.setState({ userMenuVisible: true })}>
                                    <div className="app-user-icon">
                                        <Icon name="Contact" />
                                    </div>
                                    {this.props.user.login}
                                </div>
                                <div className="app-lang-change">
                                    {languages.map((lang: string) => (
                                        <a
                                            key={lang}
                                            onClick={() => {
                                                fI18n.changeLanguage(lang, () => this.forceUpdate());
                                            }}
                                        >
                                            {lang}
                                        </a>
                                    ))}
                                </div>
                                {topActions.length > 0 && (
                                    <div className="w-backoffice-panel-top-actions">
                                        {topActions.map((action: ICommand) => {
                                            return (
                                                <div key={action.key} onClick={(ev) => action.onClick(ev, null)}>
                                                    <Icon name={action.icon} /> {action.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <Modal
                                    show={this.state.userMenuVisible}
                                    animation={"perspectiveBounce"}
                                    top={50}
                                    right={0}
                                    onHide={() => this.setState({ userMenuVisible: false })}
                                >
                                    <div style={{ width: 200 }} />
                                    <div style={{ padding: 10 }}>
                                        {/*<a onClick={() => {
                            store.changeView('access/users/account');
                            this.setState({userMenuVisible: false});
                        }}><Icon name="Accounts"/> Twoje konto</a>*/}
                                    </div>
                                    <div style={{ padding: 10 }}>
                                        <a href={Comm.basePath + "/access/logout"}>
                                            <Icon name="SignOut" /> {fI18n.t("frontend:logout")}
                                        </a>
                                    </div>
                                </Modal>
                            </div>
                        )}
                        <div
                            className={
                                "w-panel-body-container" + (this.props.isSub ? " w-panel-body-container-inner" : "")
                            }
                        >
                            {this.state.menuVisible && !this.state.onlyBody && (
                                <div className="w-panel-menu">
                                    <Menu
                                        elements={this.props.menu}
                                        onMenuElementClick={this.handleNavigateTo}
                                        mobile={this.state.layout == "mobile"}
                                    />
                                </div>
                            )}
                            <div className="w-panel-body" style={{ position: "relative" }}>
                                {!PRODUCTION && this.props.isSub == false && <DebugCommLog />}
                                {this.state.openedWindows.map((el, index) => {
                                    return (
                                        <Modal
                                            key={index}
                                            {...el.modalProps}
                                            onHide={() => {
                                                if (el.modalProps.onHide !== undefined) {
                                                    el.modalProps.onHide();
                                                }
                                                this.handleCloseWindow(el.route);
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: el.modalProps.width ? "auto" : "90vw",

                                                    backgroundColor: "#ECECEC",
                                                }}
                                            >
                                                <BackOfficeContainer
                                                    route={el.route}
                                                    props={el.props}
                                                    parentContext={this.getContext()}
                                                />
                                            </div>
                                        </Modal>
                                    );
                                })}
                                {this.state.contextState.isPackageCompiling && (
                                    <Modal show={true}>
                                        <div>
                                            <LoadingIndicator text={"Webpack compilation in progress"} />
                                        </div>
                                    </Modal>
                                )}
                                <PanelComponentLoader
                                    ref={this.panelLoader}
                                    context={{
                                        ...this.state.contextState,
                                        changeView: this.store.changeView,
                                        onViewLoad: this.store.onViewLoad,
                                        onViewLoaded: this.store.onViewLoaded,
                                    }}
                                    onLoadStart={this.handleLoadStart}
                                    onLoadEnd={this.handleLoadEnd}
                                    setPanelOption={this.handleSetPanelOption}
                                    openModal={this.handleOpenWindow}
                                    changeView={this.handleChangeView}
                                    closeModal={this.handleCloseWindow}
                                    isSub={this.props.isSub}
                                    parentContext={this.props.parentContext}
                                />
                            </div>
                        </div>
                        {this.state.navigationWindowOpened && (
                            <Modal show={true} onHide={() => this.hideGlobalMenu(null)} top={200}>
                                <div style={{ width: 300 }}>
                                    <Select
                                        onClose={() => this.hideGlobalMenu(null)}
                                        options={this.props.menu.reduce((p, c) => {
                                            return p.concat(
                                                c.elements.map((el) => {
                                                    return { label: c.title + " -> " + el.title, value: el.route };
                                                }),
                                            );
                                        }, [])}
                                        value={null}
                                        autoFocus={true}
                                        mode="list"
                                        onChange={(e) => {
                                            this.hideGlobalMenu(null);

                                            this.handleNavigateTo({
                                                title: "---",
                                                route: e.value,
                                                icon: null,
                                            });
                                        }}
                                    />
                                </div>
                            </Modal>
                        )}
                        <div id="modal-root"></div>
                    </div>
                </ObserveKeys>
            </HotKeys>
        );
    }
}
