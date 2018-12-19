import * as React from "react";
import * as ReactDOM from "react-dom";
import { ICommand } from "../lib/ICommand";
import BackOfficePanel from "../backoffice/BackOfficePanel";

interface IProps {
    isSearchBoxVisible?: boolean;
    searchPlaceholderText?: string;
    onSearch?: { (value: string): any };
    onSearchChange?: { (value: string): any };
    items: Array<ICommand>;
    rightItems?: Array<ICommand | null>;
    zIndex?: number;
}

export class CommandBar extends React.Component<IProps, any> {
    public static defaultProps: Partial<IProps> = {
        isSearchBoxVisible: false,
        searchPlaceholderText: __("Szukaj"),
        items: [],
        rightItems: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            searchedText: "",

            dropdownHeight: 0,
            dropdownShowed: false,
            dropdownVisible: 0,
            dropdownLayerVisible: "none",
            dropdownPosition: null,
            dropdownElementList: null,
            dropdownLayerHeight: "0px",
        };
    }

    handleSearchChange = (event) => {
        this.setState({ searchedText: event.target.value });
        if (this.props.onSearchChange) {
            this.props.onSearchChange(event.target.value);
        }
    };

    handleSearchKeyDown = (event) => {
        if (event.keyCode == 13) {
            if (this.props.onSearch) {
                this.props.onSearch(event.target.value);
            }
        }

    };

    render() {
        const zIndex = this.props.zIndex != undefined ? this.props.zIndex : 99;
        return (
            <div className="w-command-bar" style={{ zIndex: zIndex }}>
                {this.props.isSearchBoxVisible && (
                    <div className="search-box">
                        <i className="ms-Icon ms-Icon--Search "/>
                        <input type="text" onChange={this.handleSearchChange} onKeyUp={this.handleSearchKeyDown} placeholder="Szukaj..." autoFocus/>
                    </div>
                )}
                <div className="menu-bar">
                    <div className="buttons-left">
                        {this.props.items.map((item: ICommand | false, index: number) => {
                            if (item !== null && item !== false) {
                                if (item.subItems !== undefined) {
                                    let dropdownHeight = "100px";
                                    let dropdownVisible = "1";
                                    return (
                                        <button
                                            className={"bar-dropdown"}
                                            key={item.key}
                                            onClick={(event) => {
                                                const elementPosittion = ReactDOM.findDOMNode(event.target).getBoundingClientRect();

                                                const parent = ReactDOM.findDOMNode(this).getBoundingClientRect();

                                                const panelMenu = ReactDOM.findDOMNode(this).parentNode.getBoundingClientRect();

                                                this.setState({
                                                    dropdownElementList: item.subItems,
                                                    dropdownPosition: elementPosittion.left - parent.left,
                                                    dropdownLayerHeight: parent.height,
                                                    elementPosittion,
                                                    panelMenu,
                                                });
                                                if (this.state.dropdownHeight > 1) {
                                                    this.setState({
                                                        dropdownHeight: 0,
                                                        dropdownVisible: 0,
                                                        dropdownLayerVisible: "none",
                                                        dropdownShowed: false,
                                                    });
                                                } else {
                                                    this.setState({
                                                        dropdownHeight: 500,
                                                        dropdownVisible: 1,
                                                        dropdownLayerVisible: "block",
                                                        dropdownShowed: true,
                                                    });
                                                }
                                            }}
                                        >
                                            <i className={"ms-Icon ms-Icon--" + item.icon}/> {item.label} <i className={"ms-Icon ms-Icon--ChevronDown"}/>
                                        </button>
                                    );
                                } else {
                                    return (
                                        <a key={item.key} onClick={item.onClick}>
                                            <i className={"ms-Icon ms-Icon--" + item.icon}/> {item.label}
                                        </a>
                                    );
                                }
                            }
                            return null;
                        })}
                    </div>
                    <div className="buttons-right">
                        {this.props.rightItems.map((item: ICommand | false, index: number) => {
                            if (item !== null && item !== false) {
                                return (
                                    <a key={item.key} onClick={item.onClick} className="ms-font-m">
                                        <i className={"ms-Icon ms-Icon--" + item.icon}/> {item.label}
                                    </a>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <div
                        className={"dropdown-layer"}
                        style={{ display: this.state.dropdownLayerVisible, height: this.state.dropdownLayerHeight }}
                        onClick={() => {
                            this.setState({
                                dropdownLayerVisible: "none",
                                dropdownHeight: 0,
                                dropdownVisible: 0,
                                dropdownShowed: false,
                            });
                        }}
                    />

                    {this.state.dropdownShowed == true && (
                        <div className={"bar-dropdown-list"} style={{ maxHeight: this.state.dropdownHeight, opacity: this.state.dropdownVisible, left: this.state.dropdownPosition }}>
                            {this.state.dropdownElementList.map((element) => {
                                if (element == null) {
                                    return null;
                                }
                                if (element.type !== "input") {
                                    return (
                                        <div className={"bar-dropdown-item"} key={element.key} onClick={element.onClick}>
                                            <i className={"ms-Icon ms-Icon--" + element.icon}/>
                                            <span>{element.label}</span>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className={"bar-dropdown-item input-inside"} key={element.key} onChange={element.onChange}>
                                            <input type="text" placeholder={element.placeholder}/>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
