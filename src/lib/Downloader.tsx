import * as React from "react";
import * as ReactDOM from 'react-dom';

interface ICleanUpCallback{
    (): any;
}

interface IDownloaderProps {
    url: string;
    data?: any;
    cleanup: ICleanUpCallback;
}

interface IDownloaderState {

}

class Downloader extends React.Component<IDownloaderProps, IDownloaderState> {

    public defaultProps: Partial<IDownloaderProps> = {
        data: {}
    }

    private form: HTMLFormElement

    constructor(props) {
        super(props);
    }

    download() {
        this.form.submit();
    }

    componentDidMount() {
        this.download();
        setTimeout(() => this.props.cleanup(), 10);

    }

    render() {
        return (
          <form action={this.props.url}
                ref={(form) => this.form = form}
                style={{display: 'none'}} method="post"
                acceptCharset="UTF-8"
          >
              <textarea name="payload">{JSON.stringify(this.props.data)}</textarea>
          </form>
        );
    }
}


export const download = (url: string, data: any = {}): any => {

    let parent = document.body;

    const wrapper = parent.appendChild(document.createElement('div'));
    let cleanup = () => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
    };
    let props = {
        url: url,
        data: data
    };

    const component = ReactDOM.render(<Downloader {...props} cleanup={cleanup}/>, wrapper);


    return component.promise;
};


export default download;
