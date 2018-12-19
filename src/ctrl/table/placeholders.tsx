import * as React from "react";

export function Loading(props) {
    return <tr>
        <td className="w-table-center" colSpan={props.colspan}>
            {/*<i className="fa fa-spinner fa-spin"></i>*/}
        </td>
    </tr>;

}

export function EmptyResult(props) {
    return <tr>
        <td className="w-table-center" colSpan={props.colspan}><h4>Brak danych</h4></td>
    </tr>;

}


export function Error(props) {
    return <tr>
        <td colSpan={props.colspan}>
            <span dangerouslySetInnerHTML={{__html: props.error}}/>
        </td>
    </tr>;
}
