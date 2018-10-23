import * as React from "react";

import Dropzone from "react-dropzone";
import { IFieldProps } from "../fields/Interfaces";

import { fI18n } from "../lib";
import { alertDialog } from "../ConfirmDialog";
import { Icon } from "../Icon";
import { SortEnd } from "react-sortable-hoc";
import { formatBytes, isImage, parsePath } from "./utils";
import { SortableImageList } from "./SortableImageList";
import { PreviewModal } from "./PreviewModal";

import "./FilesLists.sass";

export interface IFile {
    key: number;
    name: string;
    size: number;
    description: string;
    title: string;
    type: "image" | "document";
    uploaded: boolean;
    nativeObj?: File;
    path: string;
}

const Progress = (props: { percent: number }) => {
    return (
        <div className="w-gallery-loader">
            <div style={{ width: props.percent + "%" }} />
        </div>
    );
};

export interface IFileListProps extends IFieldProps {
    name?: string;
    value: IFile[];
    type?: "gallery" | "filelist";
    buttonTitle?: string;
    maxLength?: number;
    itemStyle?: any;
    downloadConnector?: (file: IFile) => string;
}

export interface IFileViewerProps {
    file: IFile;
    downloadConnector: (file: IFile) => any;
}

export class FileListField extends React.Component<IFileListProps, any> {
    public static defaultProps: Partial<IFileListProps> = {
        type: "filelist",
        maxLength: null,

        itemStyle: {},
        downloadConnector: (file: IFile) => file.path,
    };

    public constructor(props: IFileListProps) {
        super(props);

        this.state = {
            filesDeleted: [],
            preview: null,
            numPages: null,
        };
    }

    public handleFileAdd = (addedFiles: Array<File & { preview: string }>) => {
        const currFiles = this.props.value ? this.props.value.slice() : [];
        for (let i = 0; i < addedFiles.length; i++) {
            if (this.props.maxLength && i >= this.props.maxLength) {
                continue;
            }
            const el = addedFiles[i];
            /*if (this.props.type == "gallery" && !isImage(el.name)) {
                alertDialog(`"${el.name}" to nie plik graficzny`);
                continue;
            }*/

            const file: IFile = {
                key: null,
                name: el.name,
                title: el.name,
                description: "",
                path: el.preview,
                type: "image",
                uploaded: false,
                size: el.size,
                nativeObj: el,
            };
            currFiles.push(file);
        }

        this.handleChange(currFiles);
    };

    public handleFileClick(index: number) {
        this.handleViewRequest(index);
    }

    public handleMoveFile = (moveEvent: SortEnd) => {
        const { oldIndex, newIndex } = moveEvent;
        const currFiles = this.props.value ? this.props.value.slice() : [];
        currFiles.splice(newIndex, 0, currFiles.splice(oldIndex, 1)[0]);
        this.handleChange(currFiles);
    };

    public handleFileRemove = (index: number) => {
        const currFiles = this.props.value ? this.props.value.slice() : [];
        const deleted = this.state.filesDeleted;
        deleted.push(currFiles[index]);
        this.setState({ filesDeleted: deleted });
        currFiles.splice(index, 1);
        this.handleChange(currFiles);
    };

    public handleChange(currFiles: IFile[]) {
        if (this.props.onChange) {
            this.props.onChange({
                name: this.props.name,
                type: "fileList",
                value: currFiles,
                event: null,
            });
        }
    }

    public handleViewRequest = (index: number) => {
        const el = this.props.value[index];
        el.path = parsePath(this.props.downloadConnector(el));

        this.setState({ preview: el });

        return;
    };

    public render() {
        const { type, maxLength, downloadConnector } = this.props;
        const { preview } = this.state;
        const value = this.props.value ? this.props.value : [];

        return (
            <div className="w-file-list">
                {(!maxLength || (value && value.length < maxLength) || !value) && (
                    <Dropzone className="dropzone" activeClassName="w-gallery-add-active" onDrop={this.handleFileAdd}>
                        <span>
                            <Icon name={"Add"} />{" "}
                            {this.props.buttonTitle ? this.props.buttonTitle : fI18n.t("frontend:add")}{" "}
                        </span>
                    </Dropzone>
                )}

                <div className={" " + (type == "gallery" ? "w-file-list-gallery" : "w-file-list-files")}>
                    {type == "filelist"
                        ? value.map((el, index) => (
                              <div className="w-file-list-element" key={el.name}>
                                  <div className="w-file-list-name">
                                      <a onClick={this.handleFileClick.bind(this, index)}>
                                          <Icon name={isImage(el.name) ? "Photo2" : "TextDocument"} />
                                          {el.name}
                                      </a>
                                      {!el.uploaded && (
                                          <div className="w-file-list-upload-info">
                                              Plik zostanie załadowany po zapisaniu formularza
                                          </div>
                                      )}
                                  </div>
                                  <div className="w-file-list-size">
                                      <a href={downloadConnector(el)} download={true}>
                                          <Icon name={"Download"} />
                                      </a>
                                  </div>
                                  <div className="w-file-list-size">{formatBytes(el.size)}</div>
                                  <div className="w-file-list-remove">
                                      <a onClick={() => this.handleFileRemove(index)}>
                                          <Icon name={"Delete"} />{" "}
                                      </a>
                                  </div>
                              </div>
                          ))
                        : null}

                    {type == "gallery" && (
                        <SortableImageList
                            helperClass={"w-file-list-dragging"}
                            files={value}
                            onSortEnd={this.handleMoveFile}
                            axis={"xy"}
                            useDragHandle={true}
                            lockToContainerEdges={true}
                            onDelete={this.handleFileRemove}
                            onClick={this.handleViewRequest}
                            itemStyle={this.props.itemStyle}
                        />
                    )}
                </div>

                {preview && (
                    <PreviewModal
                        file={preview}
                        onHide={() => this.setState({ preview: false })}
                        downloadConnector={this.props.downloadConnector}
                    />
                )}
            </div>
        );
    }
}
