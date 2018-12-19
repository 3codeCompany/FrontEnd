import * as React from "react";
import { Icon } from "../ctrl/Icon";

export interface IMenuSection {
    active: boolean;
    elements: IMenuElement[];
    icon: string;
    opened: boolean;
    title: string;
}

export interface IMenuElement {
    icon: string; //"fa-shopping-cart"
    route: string; //"app/shop/orders/index"
    title: string; //"Zamówienia"
}

interface IMenuProps {
    elements: IMenuSection[];
    onMenuElementClick: (element: IMenuElement, inWindow?: boolean) => any;
    mobile: boolean;
}

interface IMenuState {
    currentMenuOpened: number;
    expanded: boolean;
}

export class Menu extends React.Component<IMenuProps, IMenuState> {
    constructor(props: IMenuProps) {
        super(props);
        if (window.localStorage.backofficeMenuOpened === undefined) {
            window.localStorage.backofficeMenuOpened = "1";
        }

        this.state = {
            currentMenuOpened: -1,
            expanded:
                window.localStorage.backofficeMenuOpened !== undefined
                    ? window.localStorage.backofficeMenuOpened == "1"
                    : props.mobile,
        };
    }

    public handleTitleEnter(index) {
        if (!this.state.expanded) {
            this.setState({ currentMenuOpened: index });
        }
    }

    public handleMenuLeave() {
        if (!this.state.expanded) {
            this.setState({ currentMenuOpened: -1 });
        }
    }

    public handleElementClickOpen(el, event) {
        event.stopPropagation();
        this.props.onMenuElementClick(el, true);
    }

    public handleElementClick(el) {
        this.props.onMenuElementClick(el);
    }

    public changeExpandState = () => {
        window.localStorage.backofficeMenuOpened = this.state.expanded ? "0" : "1";
        this.setState({ expanded: !this.state.expanded });
    };

    public render() {
        let style = {};
        if (this.props.mobile) {
            style = {
                position: "absolute",
                top: 50,
                bottom: 0,
                zIndex: 100,
            };
        }
        return (
            <div
                className={"w-menu " + (this.state.expanded ? "w-menu-expanded" : "w-menu-collapsed")}
                onMouseLeave={this.handleMenuLeave.bind(this)}
                style={style}
            >
                {this.props.elements.map((el, index) => (
                    <div className="menu-section" key={index}>
                        <div
                            className="menu-section-title"
                            onClick={() => this.setState({ currentMenuOpened: index })}
                            onMouseEnter={this.handleTitleEnter.bind(this, index)}
                        >
                            <Icon name={el.icon} />
                            <span>{el.title}</span>
                        </div>
                        <div
                            className={
                                "menu-section-section menu-section-section-" +
                                (index == this.state.currentMenuOpened ? "opened" : "closed")
                            }
                        >
                            {!this.state.expanded && <div className="section-inner-title">{el.title}</div>}
                            {el.elements.map((el) => (
                                <div
                                    key={el.title}
                                    className="menu-link"
                                    onClick={this.handleElementClick.bind(this, el)}
                                >
                                    {el.title}
                                    <div
                                        onClick={this.handleElementClickOpen.bind(this, el)}
                                        className={"menu-link-open-window"}
                                    >
                                        <Icon name={"OpenInNewWindow"} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!this.props.mobile && (
                    <div className="menu-collapse " onClick={this.changeExpandState}>
                        <Icon name={this.state.expanded ? "DoubleChevronLeftMed" : "DoubleChevronLeftMedMirrored"} />
                    </div>
                )}
            </div>
        );
    }
}
