import * as React from "react";
import "./Timeline.sass";
interface ITimelineItemProps {
    color?: string;
    time?: string;
    user?: string;
    action?: string;
    icon?: string | ((data: ITimelineItemProps) => string | false);
}

const TimelineItem: React.StatelessComponent<ITimelineItemProps> = (props) => {
    return <div className="tab-pane">{props.children}</div>;
};

TimelineItem.defaultProps = {
    color: "blue",
};

interface ITimelineProps {
    children?: any;
}

class Timeline extends React.Component<ITimelineProps> {
    constructor(props: ITimelineProps) {
        super(props);
    }

    public render() {
        const p = this.props;
        return (
            <div className="w-timeline">
                {p.children.map((child: Array<React.StatelessComponent<ITimelineItemProps>>, index: number) => {
                    // todo zmienić struktórę
                    // @ts-ignore
                    const props: ITimelineItemProps = child.props;
                    const icon = typeof props.icon == "function" ? props.icon(props) : props.icon;
                    return (
                        <>
                            <div key={props.time + props.action}>
                                {/*{index + 1 < p.children.length && <div className="tail" />}*/}
                                <div>
                                    <div
                                        className={
                                            "head " +
                                            props.color +
                                            (icon ? " ms-Icon ms-Icon--" + icon : " head-circle")
                                        }
                                    />
                                </div>
                                <td className="content">
                                    <div className="content-head">{props.time}</div>
                                </td>
                                <td className="content">
                                    <div className="content-head">
                                        {props.user && <span className="user">[{props.user}]</span>}
                                    </div>
                                </td>
                                <td className="content">
                                    <div className="content-head">
                                        {props.action && <span className="action">{props.action}</span>}
                                    </div>
                                </td>
                            </div>
                            <div>
                                <td colSpan={4}>{child}</td>
                            </div>
                        </>
                    );
                })}
            </div>
        );
    }
}

export { Timeline, TimelineItem };
