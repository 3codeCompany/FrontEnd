import * as React from "react";
import Icon from "./Icon"

interface IPanelProps {
    title?: string,
    noPadding?: boolean,
    noBottomMargin?: boolean,
    toolbar?: Array<any>,
    children?: any,
    icon?: string
}


export default class Panel extends React.Component<IPanelProps, any> {

    public static defaultProps: Partial<IPanelProps> = {
        noPadding: false,
        noBottomMargin: true,
        children: null,
        title: "",
        toolbar: [],
        icon: "",
    };

    render() {
        const props = this.props;
        let classes = ['w-panel'];
        if (this.props.noPadding) {
            classes.push('panel-no-padding')
        }
        if (this.props.noBottomMargin) {
            classes.push('panel-no-bottom-margin')
        }
        return (
            <div className={classes.join(' ')}>
                <div className="panel-body ">
                    {props.title ? <div className="title ">
                        {props.icon && <Icon name={props.icon}/>}
                        {props.title}
                        <div className="panel-toolbar">{props.toolbar}</div>
                    </div> : ''}
                    {props.children}
                </div>
            </div>
        )
    }
}

export {Panel}
