import * as React from "react";
import * as ReactDOM from "react-dom";
import {deepIsEqual} from "frontend/src/lib/JSONTools";
import {Icon} from "frontend/src/ctrl/Icon";
import {tooltip} from "frontend/src/ctrl/Overlays";
import {IFilter} from "frontend/src/ctrl/filters/Intefaces";


export default class Thead extends React.Component<any, any> {

    public tooltipCleanup: any;

    constructor(props) {
        super(props);
        this.tooltipCleanup = null;
    }


    shouldComponentUpdate(nextProps, nextState) {
        return !deepIsEqual(
            [
                this.props.columns,
                this.props.filters,
                this.props.order,
                this.props.allChecked
            ],
            [
                nextProps.columns,
                nextProps.filters,
                nextProps.order,
                nextProps.allChecked,
            ]
        )
    }

    handleMouseEnter(index, e) {
        e.stopPropagation();
        const el = this.props.columns.filter(el => el !== null && el.display === true)[index];
        const node = ReactDOM.findDOMNode(this).querySelector(`th:nth-child(${index + 1})`);

        if (el.header.tooltip && this.tooltipCleanup === null) {
            this.tooltipCleanup = tooltip(el.header.tooltip, {
                target: () => node,
                layer: false,
                orientation: "top"
            });
        }
    }

    handleMouseLeave(index, e) {
        const el = this.props.columns.filter(el => el !== null && el.display === true)[index];
        if (el.header.tooltip) {
            this.tooltipCleanup();
            this.tooltipCleanup = null;
        }
    }


    render() {
        return (
            <thead>
            <tr>
                {this.props.selectable ?
                    <th className="w-table-selection-header" onClick={this.props.onCheckAllClicked}>
                        <input type="checkbox" checked={this.props.allChecked}/>
                    </th>
                    : null
                }
                {this.props.columns.filter(el => el !== null && el.display === true).map((el, index) => {

                    const Component = el.filter.length > 0 ? withFilterOpenLayer(el.filter) : null;
                    let classes = []
                    if (this.props.order[el.field] !== undefined) {
                        classes.push('w-table-sorted w-table-sorted-' + this.props.order[el.field].dir)
                    }
                    if (this.props.filters[el.field] !== undefined) {
                        classes.push('w-table-filtered')
                    }
                    return <th key={index}
                               style={{width: el.width}}
                               className={classes.join(' ')}
                               onClick={(e) => {
                                   el.isSortable && this.props.onCellClicked(index, e)
                               }}
                               onMouseEnter={this.handleMouseEnter.bind(this, index)}
                               onMouseLeave={this.handleMouseLeave.bind(this, index)}
                    >
                        {/*{el.order ? <i className={'fa fa-' + (el.order == 'asc' ? 'arrow-down' : 'arrow-up')}></i> : ''}*/}
                        {el.header.icon && <Icon name={el.header.icon}/>}
                        {el.caption}
                        {el.filter.length > 0 ? <Component showApply={true} onApply={this.props.onFilterChanged}/> : ''}
                    </th>;
                })}
            </tr>
            </thead>
        )
    }
}


const withFilterOpenLayer = (filters: IFilter[]) => {
    return class FilterOpenableContainer extends React.Component<any, any> {
        container: HTMLDivElement;
        body: HTMLDivElement;
        hideTimeout: any;

        constructor(props) {
            super(props)
            this.state = {
                show: false,
            }

            this.hideTimeout = null;
        }

        componentDidUpdate(nextProps, nextState) {

            if (this.state.show == true) {
                let data = this.body.getBoundingClientRect();
                if (data.right > window.innerWidth) {
                    this.body.style.right = '0px';

                } else {

                }
            }
            return true
        }

        handleTriggerClicked(e) {
            e.stopPropagation();
            this.setState({show: !this.state.show});
        }

        onFocus(e) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        onBlur(e) {

            //todo wymienić daty ( tracące focus ) i zmienić timeout na dużo niższy
            var currentTarget = e.target;
            this.hideTimeout = setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                    this.setState({show: false})
                }
            }, 300);
        }

        render() {

            let additionalHack = {
                tabIndex: 0
            }
            return (
                <div
                    className={'w-filter-openable ' + (this.state.show ? 'w-filter-openable-opened ' : '')}
                    ref={el => this.container = el}
                    {...additionalHack}
                    onBlur={this.onBlur.bind(this)}
                    onFocus={this.onFocus.bind(this)}
                    onFocusCapture={this.onFocus.bind(this)}
                    onClick={(e) => e.stopPropagation()}
                >
                    {this.props.inline ? '' :
                        <div className="w-filter-openable-trigger" onClick={this.handleTriggerClicked.bind(this)}><i className="ms-Icon ms-Icon--Filter"></i></div>
                    }
                    {this.state.show ?
                        <div className={"w-filter-openable-body " + (filters.length>=3?"w-filter-openable-body-grid":"")} ref={el => this.body = el}>
                            {filters.map(entry => {
                                let Filter = entry.component;
                                return <div key={entry.field}>
                                    {filters.length > 1 && <div className={"w-filter-openable-title"}>{entry.caption}</div>}
                                    <Filter caption={entry.caption} showApply={true} field={entry.field} onApply={this.props.onApply} config={entry.config} container={this.container}/>
                                </div>
                            })}
                        </div>
                        : ''}
                </div>
            )
        }
    }
}
