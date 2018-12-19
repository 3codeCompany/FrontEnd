import * as React from "react";
import RouterException from "../backoffice/RouterException";
import { RouteVisualization } from "./RouteVisualization";

declare var PRODUCTION: boolean;

interface IProps {
    error: any;
}

interface IState {
}

export class ServerErrorPresenter extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
    }

    public render() {
        const { error } = this.props;
        const style = { margin: 10, padding: 10, backgroundColor: "white" };

        if (error == null) {
            return <div>Null error</div>;
        }

        if (error.url !== undefined) {
            return (
                <div style={style}>
                    <ShowStack input={error.response}/>
                    <pre>{error.url}</pre>
                    <pre style={{ maxHeight: 200, overflow: "auto" }}>{JSON.stringify(error.input, null, 2)}</pre>
                </div>
            );
        }

        if (!PRODUCTION && error instanceof RouterException) {
            return (
                <div style={style}>
                    {error.message}
                    <hr/>
                    <RouteVisualization/>
                </div>
            );
        }

        return (
            <div style={style}>
                <ShowStack input={error}/>
            </div>
        );
    }
}

const ShowStack = (props) => {
    let stack;
    const error = props.input;

    if (typeof error == "string") {
        try {
            stack = JSON.parse(error);
        } catch (e) {
            return <div><pre>{error}</pre></div>;
        }
    } else {
        stack = error;
    }
    if (stack.__arrowException === undefined) {
        return <pre>{JSON.stringify(stack, null, 2)}</pre>;
    }

    stack = stack.__arrowException;

    return (
        <div>
            <div>
                <strong>
                    [{stack.code}] {stack.msg}
                </strong>
            </div>
            <hr/>
            <div>
                {stack.file}:{stack.line}
            </div>
            <pre>
                {JSON.stringify(stack.parameters, null, 2)}
            </pre>

            <hr/>
            <pre>{stack.trace}</pre>
        </div>
    );
};
