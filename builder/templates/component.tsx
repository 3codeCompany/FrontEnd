import * as React from "react";

import Navbar from "frontend/src/ctrl/Navbar";
import { Row } from "frontend/src/layout/BootstrapLayout";
import { IArrowViewComponentProps } from "frontend/src/lib/PanelComponentLoader";

interface IComponentProps extends IArrowViewComponentProps {}

interface IState {}

export default class ArrowViewComponent extends React.Component<IComponentProps, IState> {
    constructor(props: IComponentProps) {
        super(props);
        this.state = {};
    }

    public render() {
        const s = this.state;
        const p = this.props;

        return (
            <div>
                <Navbar>
                    <span>Newly generated template</span>
                </Navbar>
                <div className={"panel-body-margins"}>
                    <Row>
                        <div>Test</div>
                        <div>Test</div>
                    </Row>
                </div>
            </div>
        );
    }
}
