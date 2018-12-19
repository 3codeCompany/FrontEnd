import * as React from "react";
import {Modal, Portal} from "../Overlays";
import {Icon} from "../Icon";
import {IFieldChangeEvent, IFieldProps} from "../fields/Interfaces";
import {PositionCalculator} from "../../lib/PositionCalculator";
import {LoadingIndicator} from "../LoadingIndicator";
import {deepIsEqual} from "../../lib/JSONTools";

export interface IConnectionElement {
    value: string | number;
    label: string;
    icon: string;
    data?: any;
}

export interface IConnectionChangeEvent extends IFieldChangeEvent {
    items: IConnectionElement[];
}

export interface IConnectionsFieldProps extends IFieldProps {
    value: string[];
    maxItems?: number;
    items?: IConnectionElement[];
    searchResultProvider: (searchString: string, selected: string[]) => Promise<IConnectionElement[]>;
    selectionTemplate?: (elelent: IConnectionElement) => any;
    placeholder?: string;
    onChange?: { (changeData: IConnectionChangeEvent): any };
}

export class ConnectionsField extends React.Component<IConnectionsFieldProps, any> {
    public static defaultProps: Partial<IConnectionsFieldProps> = {
        placeholder: __("Dodaj"),
        maxItems: 10000,
        items: null
    };

    private input: HTMLInputElement;
    private dropdown: null | HTMLElement;
    private inputContainer: any;

    constructor(props: IConnectionsFieldProps) {
        super(props);
        this.state = {
            selectionOpened: false,
            selectedIndex: 0,
            search: "",
            searchResult: [],
            loading: false,
            items: props.items !== null ? props.items : [],
            props: this.props
        };
    }

    static getDerivedStateFromProps(props: IConnectionsFieldProps, state: any) {
        let ret = {};

        if (!deepIsEqual(props.items , state.props.items)) {
            ret = {
                items: props.items,
            };
        }

        if (!deepIsEqual(props.value, state.props.value)) {
            ret = {
                ...ret,
                value: props.value
            };
        }

        if (Object.entries(ret).length > 0) {
            return {...ret, props};
        }

        return null;
    }

    public handleInputFocus() {
        this.setState({selectionOpened: true, selectedIndex: -1});
    }

    public handleInputBlur() {
        this.setState({selectionOpened: false, search: ""});
    }

    public updateDropdownPosition = () => {
        if (this.dropdown != null) {
            const calculator = new PositionCalculator(this.inputContainer, this.dropdown, {
                theSameWidth: true,
                targetAt: "bottom middle",
                itemAt: "top middle"
            });
            calculator.calculate();
            calculator.calculate();
        }
    };

    public handleInputChange( e ) {
        const value = e.target.value;
        this.setState(
            {
                search: value,
                searchResult: []
            },
            this.updateDropdownPosition
        );
        if (value.length > 0) {
            this.setState({
                loading: true
            });
            this.props.searchResultProvider(value, this.props.maxItems == 1 ? [] : this.getValues()).then((result) => {
                this.setState(
                    {
                        loading: false,
                        selectedIndex: 0,
                        searchResult: result
                    },
                    this.updateDropdownPosition
                );
            });
        }
    }

    public getItems() {
        return this.state.items;
    }

    public getValues() {
        if (this.props.maxItems == 1) {
            if (this.state.items.length == 0) {
                return null;
            } else {
                return this.state.items[0].value;
            }
        }
        return this.state.items.reduce((p, c) => p.concat(c.value), []);
    }

    public handleOnChange = () => {
        if (this.props.onChange) {
            this.props.onChange({
                name: this.props.name,
                type: "ConnectionField",
                value: this.getValues(),
                event: null,
                items: this.getItems()
            });
        }
    };

    public handleSelection(el) {
        if (el) {
            this.setState(
                {
                    items: [...this.state.items, el],
                    search: ""
                },
                this.handleOnChange
            );
        }
    }

    public handleSelectionChange(index, el) {
        this.setState({selectedIndex: index});
    }

    public handleSelectionClick(index, el) {
        this.handleSelection(el);
    }

    public handleElementDelete(value) {
        let filtered = this.state.items.filter((el) => el.value != value);
        this.setState(
            {
                items: filtered
            },
            () => {
                this.handleOnChange();
            }
        );
    }

    public handleInputKeyDown(e) {
        e.stopPropagation();

        e.nativeEvent.stopImmediatePropagation();

        if (e.keyCode == 38 || e.keyCode == 40) {
            e.preventDefault();
            const changed = this.state.selectedIndex + (e.keyCode == 38 ? -1 : 1);
            if (changed >= 0 && changed < this.state.searchResult.length) {
                this.setState({selectedIndex: changed});
            }
        }
        if (e.keyCode == 13) {
            this.handleSelection(this.state.searchResult[this.state.selectedIndex]);
            e.preventDefault();
        }

        // usuwanie ostatniego brzez delete
        if (e.keyCode == 8 && e.target.value == "") {
            if (this.state.items.length > 0) {
                this.handleElementDelete(this.state.items[this.state.items.length - 1].value);
            }
        }
    }

    public render() {
        return (
            <div
                className={
                    "w-connections-field" +
                    (this.props.editable ? "" : " w-connections-field-presenter") +
                    (this.state.items.length == 0 ? " w-connections-field-presenter-empty" : "")
                }
                ref={(el) => (this.inputContainer = el)}
            >
                {this.state.items.map((el: any) => (
                    <ConnectionsFieldEntry key={el.value} {...el} onDelete={this.handleElementDelete.bind(this)}/>
                ))}

                {!this.props.editable && this.state.items.length == 0 && <>{__("Brak powiązań")}</>}

                <div
                    className="w-connections-field-input"
                    style={{display: this.state.items.length < this.props.maxItems ? "block" : "none"}}
                >
                    <input
                        type="text"
                        ref={(el) => (this.input = el)}
                        onFocus={this.handleInputFocus.bind(this)}
                        onBlur={this.handleInputBlur.bind(this)}
                        onKeyDown={this.handleInputKeyDown.bind(this)}
                        placeholder={this.props.placeholder}
                        value={this.state.search}
                        onChange={this.handleInputChange.bind(this)}
                        autoComplete="off"
                    />
                </div>

                {this.state.selectionOpened &&
                this.state.search.length > 0 && (
                    <Portal>
                        <div
                            className="w-connections-field-results"
                            style={{
                                boxShadow: "0 0 5px 0px rgba(0,0,0,0.4)",
                                border: "1px solid #eaeaea",
                                position: "absolute",
                                backgroundColor: "white",
                                overflow: "auto",
                                maxHeight: 400,
                                zIndex: 10000
                            }}
                            ref={(el) => (this.dropdown = el)}
                        >
                            {/*To jest test modala {this.state.selectedIndex}*/}
                            {this.state.loading && <LoadingIndicator/>}
                            {!this.state.loading && this.state.searchResult.length == 0 && <div>Brak wyników</div>}
                            {!this.state.loading && (
                                <Selection
                                    items={this.state.searchResult}
                                    selectedIndex={this.state.selectedIndex}
                                    selectionChange={this.handleSelectionChange.bind(this)}
                                    elementClicked={this.handleSelectionClick.bind(this)}
                                    elementTemplate={this.props.selectionTemplate}
                                />
                            )}
                        </div>
                    </Portal>
                )}
            </div>
        );
    }
}

interface IConnectionsFieldEntryProps {
    icon: string;
    label: string;
    value: string | number;
    onDelete: (value: string) => any;
}

class ConnectionsFieldEntry extends React.Component<IConnectionsFieldEntryProps, any> {
    public handleDeleteClick(value: string) {
        if (this.props.onDelete) {
            this.props.onDelete(value);
        }
    }

    public render() {
        return (
            <div className="w-connections-field-entry">
                <div className="prepend">
                    <Icon name={this.props.icon}/>
                </div>
                <div className="content">{this.props.label}</div>
                <div className="delete" onClick={this.handleDeleteClick.bind(this, this.props.value)}>
                    <Icon name="Cancel"/>
                </div>
            </div>
        );
    }
}

interface ISelectionProps {
    items: any[];
    selectedIndex: number;
    elementTemplate?: (element: any) => any;
    elementClicked?: (index: number, element: any) => any;
    selectionChange?: (index: number, element: any) => any;
}

class Selection extends React.Component<ISelectionProps, any> {
    handleMouseEnter(index, el) {
        this.props.selectionChange(index, el);
    }

    handleMouseClick(index, el) {
        this.props.elementClicked(index, el);
    }

    public render() {
        return (
            <div className="w-selection">
                {this.props.items.map((el, index) => (
                    <div
                        key={el.value}
                        className={
                            "w-selection-element " +
                            (index == this.props.selectedIndex ? "w-selection-element-selected" : "")
                        }
                        onMouseEnter={this.handleMouseEnter.bind(this, index, el)}
                        onMouseDown={this.handleMouseClick.bind(this, index, el)}
                    >
                        {this.props.elementTemplate ? this.props.elementTemplate(el) : el.label}
                    </div>
                ))}
            </div>
        );
    }
}
