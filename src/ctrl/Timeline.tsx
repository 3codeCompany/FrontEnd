import * as React from "react";


interface ITimelineItemProps {
    color?: string,
    time?: string,
    user?: string,
    action?: string,
    icon?: string | {(props): string | false},
    children?: string,
}

const TimelineItem: React.StatelessComponent<ITimelineItemProps> = (props) => {


    return (
        <div className="tab-pane">
            {props.children}
        </div>
    )
}


TimelineItem.defaultProps = {
    //kolor
    color: 'blue'
}


interface ITimelineProps {
    children?: any,
}


class Timeline extends React.Component<ITimelineProps, any> {

    constructor(props) {
        super(props);
    }


    render() {
        const p = this.props;
        return (
            <div className="w-timeline">
                <ul>
                    {p.children.map((child, index) => {
                        let icon = typeof (child.props.icon ) == "function" ? child.props.icon(child.props) : child.props.icon;
                        return <li key={index}>
                            {index + 1 < p.children.length && <div className="tail"/>}
                            <div className={'head ' + child.props.color + (icon ? ' ms-Icon ms-Icon--' + icon  : ' head-circle')}/>
                            <div className="content">
                                <p className="content-head">{child.props.time}
                                    {child.props.user && <span className="user">[{child.props.user}]</span>}
                                    {child.props.action && <span className="action">{child.props.action}</span>}
                                </p>
                                {child}

                            </div>

                        </li>
                    })}
                </ul>
            </div>
        )
    }
}

export {Timeline, TimelineItem}
