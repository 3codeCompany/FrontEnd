import React from "react";
import "./Modal.sass";
import { Positioner } from "../Positioner";
import { IPositionCalculatorOptions } from "../lib/PositionCalculator";
import { Icon } from "../Icon";
import { HotKeys } from "../HotKeys";
import { Key } from "ts-key-enum";

export interface IModalProps {
    show: boolean;

    onShow?(): any;

    onHide?(): any;

    container?(): HTMLElement;

    target?(): HTMLElement;

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
    relativePositionConf?: IPositionCalculatorOptions;
    animation?: string;

    onOrientationChange?(type: string): any;
}

export class Modal extends React.PureComponent<IModalProps> {
    public modalBody: HTMLDivElement;

    public static defaultProps = {
        show: false,

        recalculatePosition: true,
        shadow: true,
        layer: true,
        animation: "fade-in",
    };
    private modalContainer: HTMLDivElement;

    constructor(props: IModalProps) {
        super(props);
    }

    public handleClose = (e: React.MouseEvent) => {
        const target = e.target as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const scrollbarWidth = rect.width - target.clientWidth;
        const relativeMousePos = e.clientX - rect.left;
        //clicked outside of scroll bar
        if (!(rect.width - relativeMousePos < scrollbarWidth)) {
            if (e !== null) {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
            }
            if (this.props.onHide) {
                this.props.onHide();
            }
        }
    };

    public handleShow = () => {
        if (this.props.onShow) {
            document.body.style.overflow = "hidden";
            this.props.onShow();
        }
    };

    public UNSAFE_componentWillReceiveProps(nextProps: IModalProps) {
        if (this.props.show == false && nextProps.show == true) {
            this.handleShow();
        }
    }

    public componentDidMount() {
        if (this.props.show) {
            this.handleShow();
        }
    }

    public render() {
        const p = this.props;
        if (!p.show) {
            return null;
        }

        const conf: any = {};
        if (p.right !== undefined) {
            conf.right = p.right;
            conf.left = undefined;
        }
        if (p.left !== undefined) {
            conf.left = p.left;
        }
        if (p.bottom !== undefined) {
            conf.bottom = p.bottom;
            conf.top = undefined;
        }

        if (p.top !== undefined) {
            conf.top = p.top;
        }

        return (
            <>
                {p.layer && (
                    <Positioner animation={"fade-in"} absoluteSettings={{ left: 0, top: 0, right: 0, bottom: 0 }}>
                        <div
                            style={{
                                backgroundColor: p.shadow ? "rgba(0, 0, 0, 0.15)" : "transparent",
                            }}
                            ref={(el) => (this.modalContainer = el)}
                            className="w-modal-container"
                            onMouseDown={this.handleClose}
                        />
                    </Positioner>
                )}
                <Positioner
                    trackResize={this.props.recalculatePosition}
                    absoluteSettings={conf}
                    relativeTo={p.target}
                    relativeSettings={p.relativePositionConf}
                    animation={this.props.animation}
                    container={
                        p.layer
                            ? () => {
                                  return this.modalContainer;
                              }
                            : undefined
                    }
                >
                    <HotKeys
                        actions={[
                            {
                                key: Key.Escape,
                                handler: () => {
                                    this.handleClose(null);
                                },
                            },
                        ]}
                        captureInput={true}
                        observeFromInput={[Key.Escape]}
                        autofocus={true}
                    >
                        <div
                            className={`w-modal ` + (p.className !== undefined && p.className)}
                            ref={(el) => (this.modalBody = el)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: p.width ? p.width : "auto", height: p.height ? p.height : "auto" }}
                        >
                            {p.showHideLink && (
                                <a className="w-modal-close" style={{}} onClick={this.handleClose}>
                                    <Icon name="ChromeClose" />
                                </a>
                            )}
                            {p.title && (
                                <div className="w-modal-title">
                                    {p.icon && <Icon name={p.icon} />} {p.title}
                                </div>
                            )}
                            <div style={{ height: p.title ? "calc( 100% - 31px )" : "auto" }}>
                                {this.props.show ? p.children : null}
                            </div>
                        </div>
                    </HotKeys>
                </Positioner>
            </>
        );
    }
}
