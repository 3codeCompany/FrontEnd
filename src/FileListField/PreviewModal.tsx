import { Modal } from "../Modal";
import { CommandBar } from "../CommandBar";
import { printFile } from "../FilePrinter";
import * as React from "react";
import { IFileViewerProps } from "./FileListsField";
import { getViewer, globalTransformFilePath } from "./utils";
import { download } from "../Downloader";
import { fI18n } from "../lib";

interface IPreviewModal extends IFileViewerProps {
    onHide: () => any;
}

export const PreviewModal = (props: IPreviewModal) => {
    const { file } = props;
    const ViewerComponent = React.lazy(() => getViewer(file));

    // @ts-ignore
    return (
        <Modal show={true} onHide={props.onHide} title={file.name} showHideLink={true}>
            <div style={{ maxWidth: "80vw", maxHeight: "80vh", overflow: "auto" }}>
                <CommandBar
                    items={[
                        {
                            key: "f0",
                            label: fI18n.t("frontend:file.download"),
                            icon: "Download",
                            onClick: () => {
                                // window.open(parsePath(this.props.downloadConnector(file)));
                                download(file.path);
                            },
                        },
                        {
                            key: "f1",
                            label: fI18n.t("frontend:file.print"),
                            icon: "Print",
                            onClick: () => {
                                // window.open(parsePath(this.props.downloadConnector(file)));
                                printFile(file);
                            },
                        },
                        {
                            key: "f2",
                            label: fI18n.t("frontend:file.copyLink"),
                            icon: "Copy",
                            onClick: () => {
                                (document.getElementsByClassName(
                                    "w-file-preview-input",
                                )[0] as HTMLInputElement).select();
                                document.execCommand("Copy");
                            },
                        },
                        {
                            key: "f3",
                            label: fI18n.t("frontend:file.openInNewWindow"),
                            icon: "OpenInNewWindow",
                            onClick: () => {
                                window.open(file.path);
                            },
                        },
                    ]}
                />
                <div style={{ opacity: 0, height: 1, overflow: "hidden", position: "absolute" }}>
                    <input className={"form-control w-file-preview-input"} type="text" defaultValue={file.path} />
                </div>
                <div style={{ maxHeight: "calc( 80vh -  45px )", overflow: "auto" }}>
                    <React.Suspense fallback={"..."}>
                        <ViewerComponent file={file} />
                    </React.Suspense>
                </div>
            </div>
        </Modal>
    );
};
