import * as React from "react";
import {IFileViewerProps} from "../../FileLists";

export class ImageViewer extends React.Component<IFileViewerProps, any> {
    constructor(props) {
        super(props);
    }

    public render() {
        return <img style={{ maxWidth: 1000, maxHeight: 800 }} src={this.props.file.path} />;
    }
}