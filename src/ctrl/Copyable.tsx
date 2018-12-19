import Icon from "frontend/src/ctrl/Icon";
import * as React from "react";

interface ICopyableProps {
    toCopy?: string
}

export class Copyable extends React.Component<ICopyableProps, any> {
    node: HTMLSpanElement;
    nodeToCopy: HTMLSpanElement;

    state = {
        icon: "Copy",
        copyInProgress: false,
    }


    handleCopyClick() {

        this.setState({copyInProgress: true}, () => {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this.props.toCopy ? this.nodeToCopy : this.node);
            selection.removeAllRanges();
            selection.addRange(range);
            try {
                document.execCommand('copy');
                selection.removeAllRanges();

                this.setState({icon: "CheckMark", copyInProgress: false});

                setTimeout(() => {
                    this.setState({icon: "Copy"});
                }, 500)
            } catch (e) {
                alert("Can't copy, hit Ctrl+C!");
            }

        });
    }

    render() {
        let {icon, copyInProgress} = this.state;
        let {toCopy} = this.props;

        return <>
            <span ref={(el) => this.node = el}>
                {this.props.children}
            </span>
            {toCopy && <span style={{display: copyInProgress ? "block" : "none"}} ref={(el) => this.nodeToCopy = el}>{toCopy}</span>}

            <a
                onClick={this.handleCopyClick.bind(this)}
                style={{cursor: "pointer", marginLeft: toCopy ? 0 : 10}}
                title={"Skopiuj"}
            >
                <Icon name={icon}/>
            </a>

        </>
    }
}