import * as React from "react";
import ReactDOM from "react-dom";

interface IPortalProps {
    container?: () => HTMLElement;
}

export default class Portal extends React.PureComponent<IPortalProps> {
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
        }

        this.modalRoot.appendChild(this.el);
    }

    public componentWillUnmount() {
        this.modalRoot.removeChild(this.el);
    }

    public render() {
        const p = this.props;
        return ReactDOM.createPortal(p.children, this.el);
    }
}
