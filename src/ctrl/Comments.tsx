import * as React from "react";

interface ICommentsProps {
    children: any;
    commentAdded: { (comment: string): boolean }
}

class Comments extends React.Component<ICommentsProps, any> {
    textarea: HTMLTextAreaElement;

    constructor(props) {
        super(props);
        this.state = {
            addMode: false,
            rows: 1
        }

    }

    handleAddComment() {
        let result = this.props.commentAdded(this.textarea.value);
        if (result) {
            this.setState({addMode: false, rows: 1});
            this.textarea.value = "";
        }
    }

    handleCommentCancel() {
        this.setState({addMode: false, rows: 1})
        this.textarea.value = "";
    }

    handleTextareaFocus() {
        this.setState({addMode: true})
    }

    handleRowCalc() {
        const rows = this.textarea.value.split("\n").length;
        this.setState({rows: rows})
    }

    render() {
        const p = this.props;
        const s = this.state;

        return (
            <div className="w-comments">
                <div>
                    {p.children}
                </div>
                <textarea

                    placeholder={__("Dodaj komentarz")}
                    rows={this.state.rows}
                    ref={(el) => this.textarea = el} style={{width: '100%'}}
                    onFocus={this.handleTextareaFocus.bind(this)}
                    onChange={this.handleRowCalc.bind(this)}
                />
                {this.state.addMode && <div className="clearfix">
                    <a className="btn btn-primary pull-right" onClick={this.handleAddComment.bind(this)}>{__("Dodaj")}</a>
                    <a className="btn pull-right" onClick={this.handleCommentCancel.bind(this)}>{__("Anuluj")}</a>
                </div>}

            </div>
        )
    }
}

interface ICommentItemProps {
    author: string;
    time: string
    children: any
}

const CommentItem: React.StatelessComponent<ICommentItemProps> = (props) => {
    return (
        <div className="comment">
            <a className="avatar">
                <img src="https://semantic-ui.com/images/avatar/small/matt.jpg" alt=""/>
            </a>
            <div className="content">
                <a className="author">{props.author}</a>
                <div className="metadata">
                    <span className="date">{props.time}</span>
                </div>
                <div className="text">
                    {props.children}
                </div>
                {/*<div className="actions">
                    <a className="reply">Reply</a>
                </div>*/}
            </div>
        </div>

    )
}

export {Comments, CommentItem}