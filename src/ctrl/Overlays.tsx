import * as React from "react";
import * as ReactDOM from "react-dom";
import ResizeObserver from "resize-observer-polyfill";
import {Icon} from "./Icon";
import {PositionCalculator} from "../lib/PositionCalculator";

interface IShadowProps {
    visible?: boolean;
    container?: () => HTMLElement;
    loader?: boolean;
}

class Shadow extends React.Component<IShadowProps, any> {
    public static defaultProps: IShadowProps = {
        visible: true,
        loader: false,
    };

    constructor(props) {
        super(props);
    }

    public render() {
        return (
            <div>
                {this.props.visible && (
                    <div className="w-shadow">
                        {this.props.loader && (
                            <span className="loader loader-x3">
                                <i/>
                                <i/>
                                <i/>
                                <i/>
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export interface IModalProps {
    show: boolean;

    onShow?(): any;

    onHide?(): any;

    container?(): HTMLElement;

    target?(): HTMLElement;

    positionOffset?: number;
    recalculatePosition?: boolean;
    showHideLink?: boolean;
    title?: string;
    icon?: string;
    shadow?: boolean;
    layer?: boolean;
    width?: string | number;
    height?: string | number;
    top?: string | number;
    left?: string | number;
    bottom?: string | number;
    right?: string | number;
    className?: string;
    children: any;
    orientation?: string;
    animate?: boolean;
    animation?: string;

    onOrientationChange?(type: string): any;
}

interface IModalState {
}

let modalRoot = document.getElementById("modal-root");

class Modal extends React.Component<IModalProps, IModalState> {
    public el: HTMLDivElement;
    public isObserved: boolean;
    public modalBody: HTMLDivElement;
    public animationName: string;
    public modalHandler: any;

    public static defaultProps = {
        show: false,
        positionOffset: 5,
        recalculatePosition: true,
        shadow: true,
        layer: true,
        animate: false,
        animation: "fadeIn",
    };

    constructor(props) {
        super(props);
        this.state = {
            opened: props.opened,
            modalStyle: {
                opacity: 0,
            },
        };
        this.el = document.createElement("div");

        if (modalRoot == null) {
            modalRoot = document.getElementById("modal-root");
        }
    }

    public handleClose = () => {
        if (this.props.onHide) {
            this.props.onHide();
            this.animationName = "";
        }
    };

    public handleShow = () => {
        this.calculatePos();
        if (this.props.onShow) {
            this.props.onShow();
        }

        const ro = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {left, top, width, height} = entry.contentRect;

                if (this.props.recalculatePosition) {
                    this.calculatePos();
                }
            }
        });

        ro.observe(ReactDOM.findDOMNode(this.modalBody));
        this.isObserved = true;
        /* if (false) {

             let s = {opacity: 1, top: 49};
             const node = ReactDOM.findDOMNode(this.modalBody);
             TweenLite.to(s, 0.2, {
                 opacity: 1,
                 top: 50,
                 ease: Power4.easeInOut,
                 onUpdate: () => {
                     node.style['opacity'] = s.opacity;
                     node.style['top'] = s.top + '%';

                 }
             });
         }*/
    };

    public calculatePosition() {
        this.calculatePos();
    }

    public componentWillReceiveProps(nextProps: IModalProps) {
        if (this.props.show == false && nextProps.show == true) {
            this.animationName = this.props.animation;
            this.handleShow();
        }
    }

    public componentDidMount() {
        modalRoot.appendChild(this.el);
        if (this.props.show) {
            this.handleShow();
        }
    }

    public componentWillUnmount() {
        modalRoot.removeChild(this.el);
    }

    public componentDidUpdate() {
        if (this.props.show) {
            this.calculatePos();
        }
    }

    public calculatePos() {
        const container = this.props.container ? this.props.container() : document.body;
        const containerSize = container.getBoundingClientRect();

        const node = ReactDOM.findDOMNode(this.modalBody);

        if (node) {
            const data = node.getBoundingClientRect();

            if (this.props.target) {

                const target = ReactDOM.findDOMNode(this.props.target());
                const targetData = target.getBoundingClientRect();
                let left = targetData.left;
                if (left + data.width > containerSize.width) {
                    left = containerSize.width - data.width - this.props.positionOffset;
                }
                let top = targetData.top + targetData.height + this.props.positionOffset;
                if (top + data.height > containerSize.height || (this.props.orientation && this.props.orientation.indexOf("top") != -1)) {
                    // top = containerSize.height - data.height - this.props.positionOffset;
                    top = targetData.top - data.height - this.props.positionOffset;
                    if (this.props.onOrientationChange) {
                        this.props.onOrientationChange("top");
                    }
                }

                node.style.top = top + "px";
                node.style.left = left + "px";
            } else {

                let x: number = Math.round(Math.min(data.width / 2, window.innerWidth / 2 - 5));
                let y = Math.round(Math.min(data.height / 2, window.innerHeight / 2 - 5));
                x = this.props.left != undefined || this.props.right != undefined ? 0 : x;
                y = this.props.top != undefined || this.props.bottom != undefined ? 0 : y;

                if (!this.props.animate) {
                    node.style.transform = `translate(-${x}px, -${y}px)`;
                    if (this.props.left == undefined && this.props.right == undefined) {
                        node.style.left = "50%";
                    }

                } else {
                    node.style.margin = "0 auto";
                    if (this.props.left != undefined) {
                        node.style.left = this.props.left + (Number.isNaN(this.props.left as any) ? "" : "px");
                    }

                    if (this.props.right != undefined) {
                        node.style.right = this.props.right + (Number.isNaN(this.props.right as any) ? "" : "px");
                    }
                    if (this.props.left == undefined && this.props.right == undefined) {
                        node.parentNode.style.justifyContent = "center";
                        node.parentNode.style.alignItems = "center";
                    }
                }

                if (this.props.top != undefined) {
                    node.style.top = this.props.top + (Number.isNaN(this.props.top as any) ? "" : "px");
                }
                if (this.props.bottom != undefined) {
                    node.style.bottom = this.props.bottom + (Number.isNaN(this.props.bottom as any) ? "" : "px");
                }

                if (this.props.top == undefined && this.props.bottom == undefined) {
                    node.style.top = "50%";
                }
            }
        }
    }

    public shouldComponentUpdate(nextProps: IModalProps) {
        // kiedy jest pokazany lub zmienia stan z pokazanego w schowany
        return nextProps.show || (this.props.show && !nextProps.show);
    }

    public render() {
        const p = this.props;
        return ReactDOM.createPortal(
            <div
                ref={(el) => this.modalHandler = el}
                style={{
                    display: (p.animate && p.show) ? "flex" : (p.show) ? "block" : "unset",
                    visibility: (p.animate && p.show) ? "visible" : (p.show) ? "visible" : "hidden",
                    backgroundColor: p.shadow ? "rgba(0, 0, 0, 0.15)" : "transparent",
                }}
                className={(p.layer ? "w-modal-container " : "") + (p.animate && p.show ? "animate-fadeIn " : "") + p.className || ""}
                onClick={this.handleClose}
            >
                <div
                    className={`w-modal animate-${this.animationName}`}
                    ref={(el) => (this.modalBody = el)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: p.width ? p.width : "auto",
                        height: p.height ? p.height : "auto",
                    }}
                >
                    {p.showHideLink && (
                        <a className="w-modal-close" style={{}} onClick={this.handleClose}>
                            <Icon name="ChromeClose"/>
                        </a>
                    )}
                    {p.title && <div className="w-modal-title">{p.icon && <Icon name={p.icon}/>} {p.title}</div>}
                    {this.props.show ? p.children : null}
                </div>
            </div>,
            this.el,
        );
    }
}

export class Portal extends React.Component<any, any> {
    public el: HTMLDivElement;

    public static defaultProps = {};

    constructor(props) {
        super(props);
        this.el = document.createElement("div");
        if (modalRoot == null) {
            modalRoot = document.getElementById("modal-root");
        }
    }

    public componentDidMount() {
        modalRoot.appendChild(this.el);
    }

    public componentWillUnmount() {
        modalRoot.removeChild(this.el);
    }

    public render() {
        const p = this.props;
        return ReactDOM.createPortal(p.children, this.el);
    }
}

interface IConfirmModalProps extends IModalProps {
    showCancelLing?: boolean;
}

class ConfirmModal extends React.Component<IConfirmModalProps, any> {
    public promise: Promise<{}>;
    public promiseReject: any;
    public promiseResolve: any;
    public static defaultProps: Partial<IConfirmModalProps> = {
        showCancelLing: true,
    };

    constructor(props) {
        super(props);

    }

    public handleAbort = () => {
        this.props.cleanup();
    }

    public handleConfirm = () => {
        this.props.onOk();
        this.props.cleanup();
    }

    public render() {
        const modalProps: any = Object.assign({}, this.props);
        delete modalProps.cleanup;

        return (
            <Modal {...modalProps} className="w-modal-confirm" show={true}>
                <div style={{padding: 15, borderTop: "solid #0078d7 10px"}}>{this.props.children}</div>
                <div style={{padding: 10, paddingTop: 0, textAlign: "right"}}>
                    <button onClick={this.handleConfirm} className="btn btn-primary">
                        ok
                    </button>
                    {this.props.showCancelLing && <button onClick={this.handleAbort} className="btn btn-default">
                        anuluj
                    </button>}
                </div>
            </Modal>
        );
    }
}

const confirm = async (message, options: Partial<IConfirmModalProps> = {}) => {
    const props = {...options};

    const parent = options.container ? options.container() : document.body;

    const wrapper = parent.appendChild(document.createElement("div"));

    let resolver, rejector;

    const promise = new Promise((resolve, reject) => {
        resolver = resolve;
        rejector = reject;
    });

    const cleanup = () => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
        rejector();
    };

    const x: any = (
        <ConfirmModal {...props} onOk={resolver} cleanup={cleanup}>
            <div>{message}</div>
        </ConfirmModal>
    );

    ReactDOM.render(x, wrapper);

    return promise;
};

const _alert = async (message, options: IConfirmConf = {}) => {
    options.showCancelLing = false;
    return confirm(message, options);
};

export const tooltip = (content, options: ITooltipProps) => {
    const props = {...options};

    const parent = document.getElementById("modal-root");

    const wrapper = parent.appendChild(document.createElement("div"));
    const cleanup = () => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
    };

    const component = ReactDOM.render(
        <Tooltip {...props}>
            <div>{content}</div>
        </Tooltip>,
        wrapper,
    );

    return cleanup;
};

interface ITooltipProps {
    theme?: "light" | "dark";
    content?: () => any;
    type?: "hover" | "click";
    onHide?: () => any;
    target: any;
    targetAt?: string;
    itemAt?: string;
    offsetY?: number;
    offsetX?: number;
}

class Tooltip extends React.Component<ITooltipProps, any> {
    public tooltipEl: HTMLDivElement;
    public static defaultProps: Partial<ITooltipProps> = {
        theme: "dark",
        type: "hover",
        content: null,
        itemAt: "bottom middle",
        targetAt: "top middle",
        offsetX: 0,
        offsetY: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            brakeLeft: 0,
            // orientation: this.props.orientation,
            isVisible: false,
        };
    }

    public componentDidMount() {

        setTimeout(() => {
            window.requestAnimationFrame(() => {
                if (this.tooltipEl) {
                    const calculator = new PositionCalculator(this.props.target(), this.tooltipEl, {
                        targetAt: this.props.targetAt,
                        itemAt: this.props.itemAt,
                        offsetY: this.props.offsetY,
                        offsetX: this.props.offsetX,
                    });
                    calculator.calculate();
                    calculator.calculate();
                    this.tooltipEl.style.opacity = "1";
                    this.tooltipEl.focus();
                }
            });
        }, 0);

        // let targetPos = this.props.target().getBoundingClientRect();
        /// let center = Math.round(/*targetPos.left -*/ targetPos.width / 2);
        // this.setState({ brakeLeft: center });
    }

    public componentDidUpdate() {
        // let targetPos = this.props.target().getBoundingClientRect();
        // let center = Math.round(targetPos.left - ( targetPos.width / 2 ));
        // this.setState({brakeLeft: center});
    }

    public orientationChange(type) {
        // this.setState({orientation: 'top left edge'})
    }

    private handleMouseEnter = () => {
        if (this.props.type == "hover") {
            this.setState({isVisible: true});
        }
    };

    private handleMouseOut = () => {
        if (this.props.type == "hover") {
            this.setState({isVisible: false});
        }
    };

    private handleClick = () => {
        if (this.props.type == "click") {
            this.setState({isVisible: true}); // !this.state.isVisible
        }
    };

    public handleBlur = () => {
        this.setState({isVisible: false});
        if (this.props.onHide) {
            this.props.onHide();
        }
    };

    public render() {
        const {theme, content} = this.props;

        return (
            <Portal>
                <div
                    onMouseEnter={this.handleMouseEnter}
                    tabIndex={-1}
                    onBlur={this.handleBlur}
                    onMouseLeave={this.handleMouseOut}
                    onClick={this.handleClick}
                    className={"w-tooltip"}
                    ref={(el) => this.tooltipEl = el}
                >

                    <div className={`w-tooltip-hover w-tooltip-hover-${theme}`} style={{}}>
                        {this.props.children}{" "}
                        {content && content()}
                    </div>

                </div>
            </Portal>
        );
    }
}

export {Modal, Shadow, Tooltip, confirm, confirm as _confirm, _alert};
