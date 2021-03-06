import * as React from "react";
import { LoadingIndicator } from "../LoadingIndicator";

import { PrintJSON } from "../PrintJSON";
import { Shadow } from "../Shadow";

interface ILoaderContainerProps {
    /**
     * Datasource object
     */
    promise: Promise<any>;
    children: (result: any) => any;
    /**
     * Displays loaded data on bottom of container
     */
    debug?: boolean;
    /**
     * Text to show while loading
     */
    indicatorText?: string;

    /**
     * Displays content with not loaded data and refreshing it after data are loaded
     */
    prerender?: boolean;
}

export class Placeholder extends React.Component<ILoaderContainerProps, any> {
    public static defaultProps: Partial<ILoaderContainerProps> = {
        debug: false,
        prerender: false,
        indicatorText: null,
    };

    constructor(props: ILoaderContainerProps) {
        super(props);
        this.state = {
            loaded: false,
            data: null,
        };
    }

    /*public load = () => {
        this.setState(
            {
                loaded: false,
                data: null,
            },
        );
    };*/

    public componentDidMount() {
        this.props.promise
            .then((result: any) => {
                this.setState({
                    loaded: true,
                    data: result,
                });
            })
            .catch((reason) => {
                alert(reason);
                this.setState({
                    loaded: true,
                    data: reason,
                });
            });
    }

    public render() {
        const { prerender, debug, indicatorText } = this.props;
        const { loaded } = this.state;

        return (
            <div style={{ position: "relative" }}>
                {!loaded && prerender && <Shadow showLoadingIndicator={true} />}
                {!loaded && !prerender && <LoadingIndicator text={indicatorText} />}
                {(loaded || (!loaded && prerender)) && this.props.children(this.state.data)}
                {debug && (
                    <div style={{ padding: 10, margin: 5, border: "solid 1px grey" }}>
                        <b>Debug:</b>
                        <br />
                        <PrintJSON json={this.state.data} />
                    </div>
                )}
            </div>
        );
    }
}
