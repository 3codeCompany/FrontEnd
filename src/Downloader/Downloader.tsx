import * as React from "react";
import * as ReactDOM from "react-dom";

type ICleanUpCallback = () => any;

interface IDownloaderProps {
    url: string;
    data?: any;
    cleanup: ICleanUpCallback;
}

class Downloader extends React.PureComponent<IDownloaderProps> {
    public defaultProps: Partial<IDownloaderProps> = {
        data: null,
    };

    private form: HTMLFormElement;
    private a: HTMLAnchorElement;

    public download() {
        if (this.props.data == null) {
            this.a.click();
        } else {
            this.form.submit();
        }
    }

    public componentDidMount() {
        this.download();
        setTimeout(() => this.props.cleanup(), 10);
    }

    public render() {
        const { data } = this.props;
        if (data == null) {
            return (
                <a href={this.props.url} download={true} style={{ display: "none" }} ref={(el) => (this.a = el)}>
                    [[downloader]]
                </a>
            );
        }

        return (
            <form
                action={this.props.url}
                ref={(form) => (this.form = form)}
                style={{ display: "none" }}
                method="post"
                acceptCharset="UTF-8"
            >
                <textarea name="payload">{JSON.stringify(this.props.data)}</textarea>

                {Object.entries(this.props.data).map(([key, val]) => (
                    <input type="hidden" name={key} value={val as string} />
                ))}
            </form>
        );
    }
}
export interface IDownloadSuccessParams {
    fileName: string;
}

export const downloadString = (fileName: string, data: string) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.style.visibility = "none";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
};

interface IDownloadOptions {
    fileName?: string;
}

export const download = (
    url: string,
    data: any = null,
    options: IDownloadOptions = {},
): Promise<IDownloadSuccessParams> => {
    const targetUrl = url + (data !== null ? "?" + new URLSearchParams(data).toString() : "");
    const simpleURL = url;

    const promise = new Promise<IDownloadSuccessParams>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", targetUrl, true);

        xhr.responseType = "arraybuffer";

        xhr.onprogress = (evt: ProgressEvent) => {
            if (evt.lengthComputable) {
                const percentComplete = (evt.loaded / evt.total) * 100;
                console.log(percentComplete);
            } else {
                console.log("Not computable");
            }
        };
        xhr.addEventListener("load", () => {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    let fileName: string = "";
                    if (options.fileName === undefined) {
                        const contentDisposition = xhr.getResponseHeader("Content-Disposition");

                        if (contentDisposition !== null) {
                            const tmp = contentDisposition.split("filename=");

                            if (tmp.length === 2) {
                                fileName = tmp[1];
                            }
                        }

                        if (fileName === "") {
                            const tmp = simpleURL.split("/");
                            fileName = tmp[tmp.length - 1];
                        }
                    } else {
                        fileName = options.fileName;
                    }

                    downloadString(fileName, xhr.response);
                    resolve({
                        fileName,
                    });
                } else {
                    reject(xhr.response);
                }
            }
        });
        xhr.send();
    });

    return promise;
};

export const downloadOld = (url: string, data: any = null): any => {
    const parent = document.body;

    const wrapper = parent.appendChild(document.createElement("div"));
    const cleanup = () => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
    };
    const props = {
        url,
        data,
    };

    // @ts-ignore
    const component = ReactDOM.render(<Downloader {...props} cleanup={cleanup} />, wrapper);
};
