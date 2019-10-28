import * as React from "react";
import ReactDOM from "react-dom";
import { ReactNode } from "react";

interface IPortalProps {
    container?: () => HTMLElement;
}

export class Portal extends React.PureComponent<IPortalProps> {
    public el: HTMLElement;
    private modalRoot: HTMLElement;

    public static defaultProps = {};

    constructor(props: IPortalProps) {
        super(props);
        this.el = document.createElement("div");
    }

    public componentDidMount() {
        if (this.props.container != undefined) {
            this.modalRoot = this.props.container();
        } else {
            this.modalRoot = document.getElementById("modal-root");
            if (!this.modalRoot) {
                throw new Error("Modal root element not found");
            }
        }

        this.modalRoot.appendChild(this.el);
    }

    public componentWillUnmount() {
        this.modalRoot.removeChild(this.el);
    }

    public render(): ReactNode {
        const p = this.props;
        return ReactDOM.createPortal(p.children, this.el);
    }
}
