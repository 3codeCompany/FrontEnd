import * as React from "react";
import {Datasource} from "frontend/src/lib/Datasource";
import {LoadingIndicator} from "frontend/src/ctrl/LoadingIndicator";
import {Shadow} from "frontend/src/ctrl/Overlays";

interface ILoaderContainerProps {
    datasource: Datasource;
    children: { (result: any): any }
    debug?: boolean
    indicatorText?: string
    prerender?: boolean
}


export class LoaderContainer extends React.Component<ILoaderContainerProps, any> {

    public static defaultProps: Partial<ILoaderContainerProps> = {
        debug: false,
        prerender: false,
        indicatorText: null
    };

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            data: null
        }

    }

    load = () => {
        this.setState({
                loaded: false,
                data: null
            },
            () => this.props.datasource.resolve()
        );
    }

    componentDidMount() {
        this.props.datasource.observe((result) => {
            this.setState({
                loaded: true,
                data: result
            });
        });
        //setTimeout(() => this.props.datasource.resolve() , 200)
        this.props.datasource.resolve();
    }


    render() {
        let {prerender, debug, indicatorText} = this.props
        let {loaded} = this.state

        return (
            <div style={{position: "relative"}}>
                {!loaded && prerender && <Shadow loader={true}/>}
                {!loaded && !prerender && <LoadingIndicator text={indicatorText}/>}
                {(loaded || (!loaded && prerender)) && this.props.children(this.state.data)}
                {debug && <pre>{JSON.stringify(this.state.data, null, 2)}</pre>}
            </div>
        )
    }
}
