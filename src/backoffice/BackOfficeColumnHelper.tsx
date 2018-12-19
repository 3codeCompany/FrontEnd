import * as React from 'react'
import {ColumnHelper} from "frontend/src/ctrl/table/ColumnHelper";
import {Icon} from "frontend/src/ctrl/Icon";
import {confirm} from "frontend/src/ctrl/Overlays";
import Comm from 'frontend/src/lib/Comm';


export class BackOfficeColumnHelper extends ColumnHelper {

    static goto;

    static goToEdit(gotoTarget: { (row: any): string }): ColumnHelper {
        return new ColumnHelper({
            caption: '',
            template: () => <Icon name={"Edit"}/>
        })

            .noFilter()
            .className('center')
            .onClick((row) => {
                BackOfficeColumnHelper.goto(gotoTarget(row))
            })
            .width(50)
    }

    static performDelete(gotoTarget: { (row: any): string },
                         confirmMessage: { (row: any): string },
                         onSuccess: { (row: any): any }): ColumnHelper {
        return new ColumnHelper({
            caption: '',
            template: () => <Icon name={"Delete"}/>
        })
            .noFilter()
            .className('center darkred')
            .onClick((row) => {
                confirm(confirmMessage(row), {
                    title: __("Czy na pewno usunąć?"),
                    showHideLink: false,
                }).then(() => {
                    Comm._get(gotoTarget(row), {}, () => onSuccess(row))
                })
            })
            .width(50)
    }


    //goToEdit
    //performDelete
}
