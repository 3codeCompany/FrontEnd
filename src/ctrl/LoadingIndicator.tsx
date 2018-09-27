import * as React from "react";
import "./LoadingIndicator.sass";

interface ILoadingIndicatorProps {
    text?: string;
    size?: number;
}

class LoadingIndicator extends React.Component<ILoadingIndicatorProps, any> {
    public static defaultProps: Partial<ILoadingIndicatorProps> = {
        size: 1,
        text: null,
    };

    public render() {
        const { size, text } = this.props;

        return (
            <div className="w-loading-indicator">
                <div>
                    <span className={"size" + size}>
                        <i />
                        <i />
                        <i />
                        <i />
                    </span>
                    {text && <div className="w-loading-indicator-text">{text}</div>}
                </div>
            </div>
        );
    }
}

export { LoadingIndicator };
