import * as React from "react";
import Icon from "frontend/src/ctrl/Icon";

export default function(props) {
    let isVisible = Object.entries(props.order).length > 0 || Object.entries(props.filters).length > 0;
    return (
        <div className={"w-table-presenter " + (!isVisible ? "w-table-presenter-hidden" : "")}>
            <div className="w-table-presenter-inner">
                {Object.entries(props.order).map(([field, el]: any, index) => (
                    <div key={index}>
                        <div>
                            <Icon name={el.dir == "asc" ? "SortDown" : "SortUp"} />
                        </div>
                        <div className="caption">{el.caption}</div>-
                        <div className="remove" onClick={(e) => props.orderDelete(field)}>
                            <Icon name={"Clear"} />
                        </div>
                    </div>
                ))}

                {Object.entries(props.filters).map(([key, el]: any) => (
                    <div key={key}>
                        <div>
                            <i className="ms-Icon ms-Icon--Filter" />
                        </div>
                        <div className="caption">{el.caption}</div>
                        <div className="value" dangerouslySetInnerHTML={{ __html: el.label }} />
                        <div className="remove" onClick={(e) => props.FilterDelete(key)}>
                            <Icon name={"Clear"} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
