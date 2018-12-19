import * as React from "react";
import Comm from "frontend/src/lib/Comm";
import Icon from "frontend/src/ctrl/Icon";
import * as ReactDOM from "react-dom";
import { ICommand } from "../lib/ICommand";

interface IProps {
    searcherPlaceholder?: string;
    noResultText: string,
    dataURL?: string;
    onSelect: any;
    style: object;
}

export class Searcher extends React.Component<IProps, any> {
    public input: any;
    public suggestList: any;
    public forSelectKey: any;

    public static defaultProps: Partial<IProps> = {
        searcherPlaceholder: "Szukaj",
        noResultText: "Nie znaleziono",
        style: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            placeholder: this.props.searcherPlaceholder,
            dataURL: this.props.dataURL,
            data: null,
            icon: "Search",
            listVisible: "none",
            listCurrentIndex: 0,
            noResultText: null,
            currentKey: null,
        };
    }

    _handleGetData(value){
        const data = {
            value: value,
        };
        Comm._post(this.props.dataURL, data)
            .then((response) => {
                if (response.items.length == 0){
                    this.setState({
                        data: null,
                        noResultText: this.props.noResultText,
                    });
                } else {
                    this.setState({
                        data: response,
                    });
                }
            })
            .catch((error) => {
                console.log(error, "Searcher error");
            });
    };

    _handleOnSelect(item){
        this.props.onSelect(item);
    }

    _handleKeyDown = (event) => {
        if (this.suggestList.firstElementChild.classList.value !== "w-searcher-no-result"){
            const childsCount = this.suggestList.childNodes.length;
            let listIndex = this.state.listCurrentIndex;
            if (this.state.currentKey !== event.key && this.state.currentKey !== null){
                listIndex = this.state.listCurrentIndex + 2;
            }

            if (listIndex < childsCount) {
                if (listIndex <= childsCount) {
                    this.suggestList.childNodes[listIndex].classList.add("w-searcher-acitve");
                    const newIndex = listIndex + 1;
                    this.setState({
                        listCurrentIndex: newIndex,
                        currentKey: event.key,
                    });
                    this.input.value = this.state.data.items[listIndex].name + " [" + this.state.data.items[listIndex].index + "]";
                    if (this.suggestList.childNodes[listIndex - 1]){
                        this.suggestList.childNodes[listIndex - 1].classList.remove("w-searcher-acitve");
                    }
                    this.forSelectKey = listIndex;
                }
            }
            if (listIndex >= 10){
                this.suggestList.scrollTop = this.suggestList.scrollTop + 25;
            } else {
                this.suggestList.scrollTop = 0;
            }
        }
    };

    _handleKeyUp = (event) => {
        if (this.suggestList.firstElementChild.classList.value !== "w-searcher-no-result"){
            const childsCount = this.suggestList.childNodes.length;
            let listIndex = this.state.listCurrentIndex;
            if (this.state.currentKey !== event.key && this.state.currentKey !== null){
                listIndex = this.state.listCurrentIndex - 2;
            }

            if (listIndex < childsCount && listIndex >= 0) {
                if (listIndex <= childsCount) {
                    this.suggestList.childNodes[listIndex].classList.add("w-searcher-acitve");
                    const newIndex = listIndex - 1;
                    this.setState({
                        listCurrentIndex: newIndex,
                        currentKey: event.key,
                    });
                    this.input.value = this.state.data.items[listIndex].name + " [" + this.state.data.items[listIndex].index + "]";
                    this.suggestList.childNodes[listIndex + 1].classList.remove("w-searcher-acitve");
                    this.forSelectKey = listIndex;
                }
            }
            if (listIndex >= 10){
                this.suggestList.scrollTop = this.suggestList.scrollTop - 25;
            } else {
                this.suggestList.scrollTop = 0;
            }
        }
    };

    _handleKeySelect = () => {
        if (this.state.listCurrentIndex == 0){
            this.setState({
                listCurrentIndex: 1,
            });
            this.suggestList.firstElementChild.classList.add("w-searcher-acitve");
            this.input.value = this.state.data.items[0].name + " [" + this.state.data.items[0].index + "]";
        } else {
            this.setState({
                icon: "Delete",
                listVisible: "none",
                currentKey: null,
            });
        }
        this._handleOnSelect(this.state.data.items[this.forSelectKey]);
    };

    _handleKeyPress = (event) => {
        if (event.key == "ArrowDown") {
            this._handleKeyDown(event);
        }
        if (event.key == "ArrowUp") {
            this._handleKeyUp(event);
        }
        if (event.key == "Enter"){
            this._handleKeySelect();
        }
    };

    render() {
        return (
            <div style={this.props.style} className={"w-searcher"}>
                <div className={"w-searcher-input-handler"}>
                    <input
                        ref={(el) => this.input = el}
                        className={"w-searcher-input"}
                        type={"text"}
                        onKeyDownCapture={this._handleKeyPress}
                        placeholder={this.state.placeholder}
                        onClick={() => {
                            if (this.state.data){
                                this.setState({
                                    listVisible: "block",
                                });
                                for (let i = 0; i < this.suggestList.childNodes.length; i++)
                                {
                                    this.suggestList.childNodes[i].classList.remove("w-searcher-acitve");
                                }
                            }
                        }}
                        onBlur={() => {
                            setTimeout(() => {
                                this.setState({
                                    listVisible: "none",
                                    currentKey: null,
                                });
                            }, 200);
                        }}
                        onChange={(element) => {
                            if (element.target.value.length > 3) {
                                this._handleGetData(element.target.value);
                                this.setState({
                                    currentKey: null,
                                    listCurrentIndex: 0,
                                    listVisible: "block",
                                });
                            } else {
                                this.setState({
                                    currentKey: null,
                                    listCurrentIndex: 0,
                                    data: null,
                                    listVisible: "none",
                                });
                            }
                    }}
                    />
                    {this.state.icon == "Search" ?
                        <div
                            onClick={() => {
                                this.input.focus();
                            }}
                            className={"w-searcher-icon-handler"}>
                            <Icon name={"Search"}/>
                        </div>
                        :
                        <div
                            onClick={() => {
                                this.input.value = "";
                                this.setState({
                                    data: null,
                                    icon: "Search",
                                    listCurrentIndex: 0,
                                });
                            }}
                            className={"w-searcher-icon-handler icon-delete"}>
                            <Icon name={"Delete"}/>
                        </div>
                    }

                </div>
                <ul style={{display: this.state.listVisible}} className={"w-searcher-item-list"} ref={(el) => this.suggestList = el}>
                    {this.state.data ?
                        this.state.data.items.map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    className={"w-searcher-item"}
                                    onClick={() => {
                                        this._handleOnSelect(item);
                                        this.setState({
                                            icon: "Delete",
                                            listVisible: "none",
                                            listCurrentIndex: index,
                                        });
                                        this.input.value = item.name + " [" + item.index + "]";
                                    }}
                                >{item.name} <span className={"bold"}>[{item.index}]</span></li>
                            );
                        })
                        : <div className={"w-searcher-no-result"}>{this.props.noResultText}</div>
                    }
                </ul>
            </div>
        );
    }
}
