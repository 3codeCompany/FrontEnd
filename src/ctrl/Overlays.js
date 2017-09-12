import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Modal from 'react-overlays/lib/Modal';
import Overlay from 'react-overlays/lib/Overlay';
import ResizeObserver from 'resize-observer-polyfill';
import TweenLite from 'gsap/TweenLite'


class Shadow extends Component {
    static defaultProps = {
        visible: true
    };

    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            {this.props.visible && <div className="w-shadow">
                {this.props.loader && <span className="loader loader-x3">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
            </span>}
            </div>}
        </div>;
    }

}


class MyModal extends Component {

    static propTypes = {

        show: PropTypes.bool,
        onShow: PropTypes.func,
        onHide: PropTypes.func,
        container: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        //containerElement: PropTypes.node
        positionOffset: PropTypes.number,
        container: PropTypes.func,
        recalculatePosition: PropTypes.bool,
        showHideLink: PropTypes.bool,
        fitWidth: PropTypes.bool,
        fitHeight: PropTypes.bool,
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        bottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        right: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    };
    static defaultProps = {
        show: false,
        positionOffset: 5,
        recalculatePosition: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            opened: props.opened,
            modalStyle: {
                opacity: 0
            }
        };
        this.modalBody = null;
    }


    handleClose() {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    handleShow() {
        this.calculatePos();
        if (this.props.onShow) {
            this.props.onShow();
        }

        const ro = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                const {left, top, width, height} = entry.contentRect;

                if (this.props.recalculatePosition) {
                    this.calculatePos();
                }
            }
        });

        ro.observe(ReactDOM.findDOMNode(this.modalBody));
        this.isObserved = true;
        if (false) {

            let s = {opacity: 1, top: 49};
            const node = ReactDOM.findDOMNode(this.modalBody);
            TweenLite.to(s, 0.2, {
                opacity: 1,
                top: 50,
                ease: Power4.easeInOut,
                onUpdate: () => {
                    node.style['opacity'] = s.opacity;
                    node.style['top'] = s.top + '%';


                }
            });
        }

    }

    componentDidUpdate(prevProps, prevState) {

    }

    calculatePosition() {
        this.calculatePos();
    }

    calculatePos() {


        let container = this.props.container ? this.props.container() : document.body;
        let containerSize = container.getBoundingClientRect();

        const node = ReactDOM.findDOMNode(this.modalBody);
        if (node) {
            let data = node.getBoundingClientRect();

            if (this.props.target) {
                const target = ReactDOM.findDOMNode(this.props.target());
                let targetData = target.getBoundingClientRect();
                let left = targetData.left;
                if (left + data.width > containerSize.width) {
                    left = containerSize.width - data.width - this.props.positionOffset;
                }
                let top = targetData.top + targetData.height + this.props.positionOffset;
                if (top + data.height > containerSize.height) {
                    top = containerSize.height - data.height - this.props.positionOffset;
                }

                node.style['top'] = top + 'px';
                node.style['left'] = left + 'px';
            } else {

                let x = Math.min(Math.round(data.width / 2), (window.innerWidth) / 2 - 5);
                let y = Math.min(Math.round(data.height / 2), (window.innerHeight / 2) - 5);
                x = this.props.left != undefined || this.props.right != undefined ? 0 : x;
                y = this.props.top != undefined || this.props.bottom != undefined? 0 : y;
                node.style['transform'] = `translate(-${x}px, -${y}px)`;


                if (this.props.left != undefined) {
                    node.style['left'] = this.props.left + (Number.isNaN(this.props.left) ? '' : 'px');
                }
                if (this.props.right != undefined) {
                    node.style['right'] = this.props.right + (Number.isNaN(this.props.right) ? '' : 'px');
                }
                if( this.props.left == undefined  && this.props.right == undefined) {
                    node.style['left'] = '50%';
                }

                if (this.props.top!= undefined) {
                    node.style['top'] = this.props.top + (Number.isNaN(this.props.top) ? '' : 'px');
                }
                if (this.props.bottom != undefined) {
                    node.style['bottom'] = this.props.bottom + (Number.isNaN(this.props.bottom) ? '' : 'px');
                }

                if( this.props.top == undefined  && this.props.bottom == undefined) {
                    node.style['top'] = '50%';
                }
            }
        }
    }

    render() {
        let p = this.props;

        let modalProps = Object.assign({}, p);
        delete modalProps.showHideLink;
        delete modalProps.positionOffset;
        delete modalProps.recalculatePosition;

        return (<Modal
            {...modalProps}
            aria-labelledby='modal-label'
            className={'w-modal-container ' + p.className}
            backdropClassName="w-modal-shadow"
            onHide={this.handleClose.bind(this)}
            onShow={this.handleShow.bind(this)}
            onEntered={() => console.log('entered')}
        >

            <div className="w-modal" ref={el => this.modalBody = el}>
                {p.showHideLink &&
                <a className="w-modal-close" style={{}} onClick={this.handleClose.bind(this)}> <i
                    className="fa fa-close"></i></a>}
                {p.title && <div className="w-modal-title">{p.title}</div>}
                {p.children}
            </div>
        </Modal>);
    }

}

class ConfirmModal extends Component {
    constructor(props) {
        super(props);
        this.promiseResolve = this.promiseReject = null;
        this.promise = new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
        });
    }

    handleAbort() {
        this.promiseReject();
        this.props.cleanup();
    }

    handleConfirm() {
        this.promiseResolve();

        this.props.cleanup();
    }

    render() {
        let modalProps = Object.assign({}, this.props);
        delete modalProps.cleanup;

        return <MyModal {...modalProps} className="w-modal-confirm" show={true}>
            <div style={{padding: 15}}>{this.props.children}</div>
            <div style={{padding: 10, paddingTop: 0, textAlign: 'right'}}>
                <button onClick={this.handleConfirm.bind(this)} className="btn btn-primary">ok
                </button>
                <button onClick={this.handleAbort.bind(this)} className="btn btn-default">anuluj
                </button>
            </div>
        </MyModal>;
    }

}


const confirm = (message, options = {}) => {
    let props = {...options};

    let parent = options.container ? options.container() : document.body;

    const wrapper = parent.appendChild(document.createElement('div'));
    let cleanup = () => {
        ReactDOM.unmountComponentAtNode(wrapper);
        wrapper.remove();
    };

    const component = ReactDOM.render(<ConfirmModal {...props} cleanup={cleanup}>
        <div>
            {message}
        </div>
    </ConfirmModal>, wrapper);


    return component.promise;
};


class Tooltip extends React.Component {

    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = {
            opened: false
        };
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.target) {
            this.setState({opened: true});
        } else {
            this.setState({opened: false});
        }
        if (nextProps.opened) {
            this.setState({opened: nextProps.opened});
        }
    }


    componentDidUpdate() {
        if (this.state.opened) {
            //ReactDOM.findDOMNode(this.refs.body).focus();
        }
    }

    handleBlur() {
        this.setState({opened: false});
    }

    render() {
        let p = this.props;
        return (
            <Overlay
                show={this.state.opened}
                onHide={() => this.setState({show: false})}
                placement={p.placement}
                container={p.container}
                shouldUpdatePosition={true}
                target={props => {
                    return ReactDOM.findDOMNode(p.target);
                }}
            >
                <div
                    tabIndex={1}
                    style={{display: this.state.opened ? 'block' : 'none', position: 'absolute'}}
                    className="w-tooltip"
                    autoFocus={true}
                    /*onBlur={this.handleBlur.bind(this)}*/
                    ref="body"
                >
                    {this.props.children}
                </div>
            </Overlay>
        );

    }
}


export {MyModal as Modal, Shadow, Tooltip, confirm};
