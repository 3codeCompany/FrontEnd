import * as React from "react";

import { arrayMove, SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import Dropzone from "react-dropzone";
import { IFieldProps } from "./fields/Interfaces";
import { Icon } from "frontend/src/ctrl/Icon";
import { _alert, Modal } from "frontend/src/ctrl/Overlays";
import { CommandBar } from "./CommandBar";
import PrintJSON from "../utils/PrintJSON";

import { printFile } from "../utils/FilePrinter";
import {LoadingIndicator} from "./LoadingIndicator";
import {ImageViewer} from "./files/viewers/ImageViewer";
import {PDFViewer} from "./files/viewers/PDFViewer";

let baseUrl = "";
if (window.location.host.indexOf("esotiq") != -1) {
    baseUrl = "https://static.esotiq.com/";
}

const parsePath = (path) => {
    if (path.charAt(0) != "/") {
        path = "/" + path;
    }
    return baseUrl + path;
};

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

const DragHandle = SortableHandle(() => (
    <a className="w-gallery-drag">
        <Icon name={"SIPMove"} />
    </a>
)); //

const Progress = (props) => {
    return (
        <div className="w-gallery-loader">
            <div style={{ width: props.percent + "%" }} />
        </div>
    );
};

const ImageBox = SortableElement((props) => {
    const file = props.file;
    let isImage = false;
    if (file.path.match(/.(jpg|jpeg|png|gif)$/i)) {
        isImage = true;
    }
    if (file.type && file.type.indexOf("image") != -1) {
        isImage = true;
    }

    const style = props.style || {};

    if (!file.uploaded) {
        /*let reader = new FileReader();
        reader.addEventListener("load", function () {
            preview.src = reader.result;
        }, false);
        reader.readAsDataURL(file.nativeObj);*/
    }

    return (
        <div style={style}>
            <div onClick={() => props.onClick(props._index)} className={"w-image-box"}>
                <span>
                    <span />
                    {file.uploaded ? <img src={parsePath(file.path)} alt="" /> : <Icon name={"Upload"} />}

                    <div className="w-gallery-on-hover">
                        <a
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onDelete(props._index);
                            }}
                            className="w-gallery-delete"
                        >
                            <Icon name={"Clear"} />{" "}
                        </a>
                        <DragHandle />
                    </div>
                </span>
                <div className="w-gallery-name">{file.name}</div>
            </div>
        </div>
    );
});

const SortableImageList = SortableContainer((props) => {
    return (
        <div className="w-gallery-list">
            {props.files &&
                props.files.map((file, index) => (
                    <ImageBox
                        file={file}
                        key={file.name}
                        index={index}
                        _index={index}
                        onClick={props.onClick}
                        onDelete={props.onDelete}
                        style={props.itemStyle}
                    />
                ))}
        </div>
    );
});

export interface IFileList extends IFieldProps {
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
}


class FileList extends React.Component<IFileList, any> {
    public viewerRegistry = [];
    public static defaultProps: Partial<IFileList> = {
        type: "filelist",
        maxLength: null,
        buttonTitle: __("Dodaj"),
        itemStyle: {},
        downloadConnector: (file: IFile) => file.path,
    };

    public constructor(props: IFileList) {
        super(props);

        this.state = {
            filesDeleted: [],
            preview: null,
            numPages: null,
            viewers: {},
        };

        this.viewerRegistry = [
            {
                filter: /.(jpg|jpeg|png|gif)$/i,
                viewer: ImageViewer,
            },
            {
                filter: /.(pdf)$/i,
                viewer: PDFViewer,
            },
        ];
    }

    public handleFileAdd(addedFiles: Array<File & { preview: string }>) {
        const currFiles = this.props.value ? this.props.value.slice() : [];
        for (let i = 0; i < addedFiles.length; i++) {
            if (this.props.maxLength && i >= this.props.maxLength) {
                continue;
            }
            const el = addedFiles[i];
            if (this.props.type == "gallery" && !this.isImage(el.name)) {
                alert(`"${el.name}" to nie plik graficzny`);
                continue;
            }

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
    }

    public handleFileClick(index) {
        this.handleViewRequest(index);
    }

    public handleMoveFile(moveEvent) {
        const { oldIndex, newIndex } = moveEvent;
        const currFiles = this.props.value ? this.props.value.slice() : [];
        currFiles.splice(newIndex, 0, currFiles.splice(oldIndex, 1)[0]);
        this.handleChange(currFiles);
    }

    public handleFileRemove(index) {
        const currFiles = this.props.value ? this.props.value.slice() : [];
        const deleted = this.state.filesDeleted;
        deleted.push(currFiles[index]);
        this.setState({ filesDeleted: deleted });
        currFiles.splice(index, 1);
        this.handleChange(currFiles);
    }

    public handleChange(currFiles) {
        if (this.props.onChange) {
            this.props.onChange({
                name: this.props.name,
                type: "fileList",
                value: currFiles,
                event: null,
            });
        }
    }

    public formatBytes(bytes) {
        if (bytes < 1024) {
            return bytes + " Bytes";
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes < 1073741824) {
            return (bytes / 1048576).toFixed(2) + " MB";
        } else {
            return (bytes / 1073741824).toFixed(2) + " GB";
        }
    }

    public isImage(path) {
        return path.match(/.(jpg|jpeg|png|gif|mp4)$/i);
    }

    public handleViewRequest = (index) => {
        const el = this.props.value[index];
        el.path = parsePath(this.props.downloadConnector(el));

        console.log(el);

        let viewer = null;
        for (const element of this.viewerRegistry) {
            if ((el.name && el.name.match(element.filter)) || el.path.match(element.filter)) {
                viewer = element.viewer;
                break;
            }
        }

        if (viewer === null) {
            _alert("Brak podglądu do tego rodzaju plików");
            return;
        }

        this.setState({ preview: el, viewer });

        return;
    };

    public render() {
        const { value, type, maxLength, downloadConnector } = this.props;
        const { preview } = this.state;
        const deleted = this.state.filesDeleted;
        const ViewerComponent = this.state.viewer;

        return (
            <div className="w-file-list">
                {(!maxLength || (value && value.length < maxLength) || !value) && (
                    <Dropzone
                        className="dropzone"
                        activeClassName="w-gallery-add-active"
                        onDrop={this.handleFileAdd.bind(this)}
                    >
                        <span>
                            <Icon name={"Add"} /> {this.props.buttonTitle}{" "}
                        </span>
                    </Dropzone>
                )}

                <div className={" " + (type == "gallery" ? "w-file-list-gallery" : "w-file-list-files")}>
                    {/*{deleted.map((el) => <div>Do usuni�cia: {el.name}</div>)}*/}
                    {value && Array.isArray(value) && type == "filelist"
                        ? value.map((el, index) => (
                              <div className="w-file-list-element" key={el.name}>
                                  <div className="w-file-list-name">
                                      <a onClick={this.handleFileClick.bind(this, index)}>
                                          <Icon name={this.isImage(el.name) ? "Photo2" : "TextDocument"} />
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
                                  <div className="w-file-list-size">{this.formatBytes(el.size)}</div>
                                  <div className="w-file-list-remove">
                                      <a onClick={this.handleFileRemove.bind(this, index)}>
                                          <Icon name={"Delete"} />{" "}
                                      </a>
                                  </div>
                              </div>
                          ))
                        : null}
                    {/*  <pre>
                        {JSON.stringify(value, null, 2)}
                    </pre>*/}

                    {value &&
                        type == "gallery" && (
                            <SortableImageList
                                helperClass={"w-file-list-dragging"}
                                files={value}
                                onSortEnd={this.handleMoveFile.bind(this)}
                                axis={"xy"}
                                useDragHandle={true}
                                lockToContainerEdges={true}
                                onDelete={this.handleFileRemove.bind(this)}
                                onClick={this.handleViewRequest}
                                itemStyle={this.props.itemStyle}
                            />
                        )}
                </div>
                {/*<pre>
                    {JSON.stringify(preview, null, 2)}
                </pre>*/}

                {preview && (
                    <Modal
                        show={true}
                        onHide={() => this.setState({ preview: null })}
                        title={preview.name}
                        showHideLink={true}
                        width={1000}
                    >
                        <CommandBar
                            items={[
                                {
                                    key: "f3",
                                    label: "Drukuj",
                                    icon: "Print",
                                    onClick: () => {
                                        // window.open(parsePath(this.props.downloadConnector(preview)));
                                        printFile(preview);
                                    },
                                },
                                {
                                    key: "f0",
                                    label: "Kopiuj link",
                                    icon: "Copy",
                                    onClick: () => {
                                        this.clipurl.select();
                                        document.execCommand("Copy");
                                    },
                                },
                                {
                                    key: "f1",
                                    label: "Otwórz w nowym oknie",
                                    icon: "OpenInNewWindow",
                                    onClick: () => {
                                        window.open(this.props.downloadConnector(preview));
                                    },
                                },
                            ]}
                        />
                        <div style={{ opacity: 0, height: 1, overflow: "hidden" }}>
                            <input
                                className={"form-control"}
                                type="text"
                                value={this.props.downloadConnector(preview)}
                                ref={(el) => (this.clipurl = el)}
                            />
                        </div>
                        <ViewerComponent file={preview} />
                    </Modal>
                )}
            </div>
        );
    }
}

export { FileList };
