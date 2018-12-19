import * as React from "react";
import { Icon } from "frontend/src/ctrl/Icon";

type ITabsCallback = (index: number, e: any) => any;

interface ITabsProps {
    children: JSX.Element[] | any[];
    onTabChange?: ITabsCallback;
    defaultActiveTab?: number;
    activeTab?: number;
    mountAllTabs?: boolean;
}

interface ITabsState {
    currentTab: number;
}

class Tabs extends React.Component<ITabsProps, ITabsState> {
    public static defaultProps: Partial<ITabsProps> = {
        mountAllTabs: false
    };

    constructor(props: ITabsProps) {
        super(props);
        this.state = {
            currentTab: props.activeTab || props.defaultActiveTab || 0
        };
    }

    public handleTabChange(index: number, e) {
        if (this.props.onTabChange) {
            this.props.onTabChange(index, e);
        }
        if (this.props.activeTab == null) {
            this.setState({ currentTab: index });
        }
    }

    public componentWillReceiveProps(nextProps: Readonly<ITabsProps>, nextContext: any): void {
        if (nextProps.activeTab != null) {
            this.setState({ currentTab: nextProps.activeTab });
        }
    }

    public render() {
        const p = this.props;
        const s = this.state;

        return (
            <div className="w-tabs">
                <div className="tabs-links">
                    {React.Children.toArray(p.children).map((child: any, index) => {
                        return (
                            <div
                                key={index}
                                className={
                                    (index == s.currentTab ? "active" : "") +
                                    " " +
                                    (child.props.badge ? "with-badge" : "")
                                }
                                onClick={this.handleTabChange.bind(this, index)}
                            >
                                {child.props.icon ? <Icon name={child.props.icon} /> : null}
                                {child.props.title}
                                {child.props.badge != undefined ? (
                                    <div className="w-tabs-badge">{child.props.badge}</div>
                                ) : null}
                                {child.props.onClose && (
                                    <a
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            child.props.onClose(index);
                                        }}
                                        className={"tabs-close"}
                                    >
                                        <Icon name={"ChromeClose"} />
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="tabs-links-separator" />
                <div className="tab-pane-container">
                    {!this.props.mountAllTabs && React.Children.toArray(p.children)[s.currentTab]}

                    {this.props.mountAllTabs && (
                        <div>
                            {React.Children.map(p.children, (child: any, index) => {
                                if (child == null) {
                                    return;
                                }
                                return <div style={{ display: index == s.currentTab ? "block" : "none" }}>{child}</div>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

interface ITabPaneProps {
    title: string;
    badge?: string | number;
    icon?: string;
    children?: any;
    onClose?: (index: number) => any;
}

const TabPane: React.StatelessComponent<ITabPaneProps> = (props) => {
    return <div className="tab-pane">{props.children}</div>;
};

export { Tabs, TabPane };
