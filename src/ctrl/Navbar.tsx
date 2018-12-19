import * as React from "react";
import {ICommand} from "../lib/ICommand";

interface IProps {
    children: any;
    toolbar?: any[];
}

export default (props: IProps) => {

    const children = Array.isArray(props.children) ? props.children : [props.children];

    return (
        <div className="w-navbar">
            <ol>
                {children.map((child, key) => {
                    if (child !== null) {
                        return <li key={key} className={"ms-font-m " + (key + 1 == props.children.length ? "active" : "")}>
                            {child}
                            <i className="ms-Icon ms-Icon--ChevronRight" aria-hidden="true"/>
                        </li>;
                    }
                    return null;
                })}
            </ol>

            <div style={{float: "right"}}>
                <div style={{display: "table-cell", height: "50px", verticalAlign: "middle"}}>
                    {props.toolbar}
                </div>
            </div>
        </div>

    )
}



