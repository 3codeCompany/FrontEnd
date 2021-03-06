import * as React from "react";
import { Trans } from "react-i18next";
import { IColumnData } from "./Interfaces";
import { Icon } from "../Icon";
import { fI18n } from "../lib";

interface IFooterProps {
    count: number;
    onPage: number;
    currentPage: number;
    columns: IColumnData[];
    onPageChanged: (page: number) => any;
    currentPageChanged: (page: number) => any;
    reload: () => any;
}

export default class Footer extends React.Component<IFooterProps> {
    constructor(props: IFooterProps) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: IFooterProps, nextState: IFooterProps) {
        return true;
        /*return !deepIsEqual(
            [
                this.props.columns,
                this.props.onPage,
                this.props.currentPage
            ],
            [
                nextProps.columns,
                nextProps.onPage,
                nextProps.currentPage
            ]
        )*/
    }

    public render() {
        const props = this.props;

        const pages = Math.max(Math.ceil(props.count / props.onPage), 1);

        const leftRightCount = 0;

        const from = Math.max(1, Math.min(pages - leftRightCount * 2, Math.max(1, props.currentPage - leftRightCount)));
        const arr = ((a: number, b: number[]) => {
            while (a--) {
                b[a] = a + from;
            }
            return b;
        })(Math.min(leftRightCount * 2 + 1, pages > 0 ? pages : 1), []);

        return (
            <tr>
                <td colSpan={props.columns.length + 1} className="w-table-footer-main">
                    <div className="w-table-pager">
                        <div onClick={(e) => props.currentPageChanged(1)}>
                            <Icon name={"DoubleChevronLeft12"} />
                        </div>
                        <div onClick={(e) => props.currentPageChanged(Math.max(1, props.currentPage - 1))}>
                            <Icon name={"ChevronLeft"} />
                        </div>
                        {arr.map((el, i) => (
                            <div
                                key={i}
                                onClick={(e) => props.currentPageChanged(el)}
                                className={el == props.currentPage ? "w-table-pager-active" : ""}
                            >
                                {el}
                            </div>
                        ))}
                        <div onClick={(e) => props.currentPageChanged(Math.min(props.currentPage + 1, pages))}>
                            <Icon name={"ChevronRight"} />
                        </div>
                        <div onClick={(e) => props.currentPageChanged(pages)}>
                            <Icon name={"DoubleChevronRight12"} />
                        </div>
                    </div>

                    <div className="w-table-footer-pageinfo">
                        {props.currentPage} / {pages} [ {props.count} ]
                    </div>

                    <div className="w-table-footer-onpage-select">
                        <span>{fI18n.t("Na stronie")}</span>
                        <select value={props.onPage} onChange={(e) => props.onPageChanged(parseInt(e.target.value))}>
                            {[10, 25, 50, 100, 500].map((x, i) => (
                                <option key={"onpageval" + x} value={x}>
                                    {x}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-table-buttons">
                        <button
                            title="Od??wie??"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                this.props.reload();
                            }}
                        >
                            <Icon name={"Sync"} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }
}
