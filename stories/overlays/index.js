import React from 'react';
import ReactDOM from 'react-dom';
import {storiesOf} from '@storybook/react';

import Panel from '../../src/ctrl/Panel';
import {Row} from '../../src/layout/BootstrapLayout';
import {Modal, Shadow, Tooltip, confirm} from '../../src/ctrl/Overlays'


const formImport = `
        ~~~js
        import { Text, Switch, Select, CheckboxGroup, Textarea } from "frontend/lib/ctrl/Fields"
        ~~~
        `;

class Base extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true
        }

        //setTimeout(() => this.setState({visible: true}), 500)
    }

    render() {
        return (
            <div>

                <Modal
                    show={this.state.visible}
                    showHideLink={false}
                >
                    <div style={{padding: '20px'}}>
                        Content
                        <button onClick={() => this.setState({visible: false})}>hide</button>
                    </div>
                </Modal>
            </div>
        )
    }
}

class All extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }


    }

    handleConfirm(e){
        confirm("Czy na pewno to zrobić?", {target: () => e.target}).then(()=>{
            alert("confirmed")
        }).catch( () =>{
          alert("unconfirmed");
        })
    }

    render() {
        return (
            <div>
                <button onClick={(e) => this.setState({show: true})} ref="button">Open modal</button>
                <button onClick={this.handleConfirm.bind(this)} ref="confirmbutton" className="pull-right">Open confirm</button>

                <Modal
                    show={this.state.show}
                    showHideLink={true}
                    onHide={(e) => this.setState({show: false})}
                    title="Modal test title"
                    target={() => this.refs.button}
                >

                    <div style={{padding: '20px'}}>
                        Content

                    </div>
                </Modal>
            </div>
        )
    }
}

class TooltipExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            tooltipTrigger: null,
            position: 'center',
            tooltipLoading: true
        }

        this.tootlipTimeout = null;

    }

    handleHover(e) {
        clearTimeout(this.tootlipTimeout);
        this.setState({
            tooltipTrigger: e.target,
            content: (new Date().getTime() ) + '',
            position: e.target.innerHTML,
            tooltipLoading: true
        });
        this.tootlipTimeout = setTimeout(() => this.setState({tooltipLoading: false}), 200)

    }

    handleOut(e) {
        //this.setState({tooltipTrigger: null});
    }

    render() {
        let margin = {
            margin: '30px'
        }
        let style = {
            border: 'solid 1px black',
            padding: '20px',
            //margin: '30px auto',
            width: '200px',
            textAlign: 'center',
            backgroundColor: 'rgb(245,245,245)'
        };
        const s = this.state;
        return ( <div style={{position: 'relative'}}>


            <Row>
                <div style={margin}>
                    <div
                        style={style}
                        onMouseEnter={this.handleHover.bind(this)}
                        onMouseOut={this.handleOut.bind(this)}
                    >
                        top
                    </div>
                </div>
                <div style={margin}>
                    <div
                        style={style}
                        onMouseEnter={this.handleHover.bind(this)}
                        onMouseOut={this.handleOut.bind(this)}
                    >bottom
                    </div>
                </div>
            </Row>
            <Row>
                <div style={margin}>
                    <div
                        style={style}
                        onMouseEnter={this.handleHover.bind(this)}
                        onMouseOut={this.handleOut.bind(this)}
                    >left
                    </div>
                </div>
                <div style={margin}>
                    <div
                        style={style}
                        onMouseEnter={this.handleHover.bind(this)}
                        onMouseOut={this.handleOut.bind(this)}
                    >right
                    </div>
                </div>
            </Row>

            <Row>
                <div
                    style={style}
                    onMouseEnter={this.handleHover.bind(this)}
                    onMouseOut={this.handleOut.bind(this)}
                >right bottom
                </div>
                <div
                    style={style}
                    onMouseEnter={this.handleHover.bind(this)}
                    onMouseOut={this.handleOut.bind(this)}
                >left top
                </div>

            </Row>


            <Tooltip placement={this.state.position} ref="tooltip" target={this.state.tooltipTrigger} container={this}>
                {s.tooltipLoading ?
                    <div><i className="fa fa-spin fa-spinner"></i></div>
                    :
                    <div>
                        <h5>Tutaj treść</h5>
                        <p>{s.content}</p>
                    </div>
                }
            </Tooltip>


        </div>)
    }
}


class ContainerExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opened: false
        }

        setTimeout(() => this.setState({opened: true}), 500)
    }

    render() {
        return (
            <div>
                <div
                    style={{position: 'relative', height: '200px', width: '200px', border: 'dashed 1px grey', margin: '30px'}}
                    ref="container1"
                >
                    <Shadow container={() => this.refs.container1}/>

                </div>
                <div
                    style={{position: 'relative', height: '200px', width: '200px', border: 'dashed 1px grey', margin: '30px'}}
                    ref="container2"
                >
                    <Shadow container={() => this.refs.container2}/>
                </div>

            </div>
        )
    }
}

storiesOf('Overlays', module)
    .addWithInfo(
        'Modal naked',
        'Tutaj opis',
        () => (
            <Panel>
                <Base/>
                <div style={{width: '500px', height: '500px', position: 'relative'}} className="modal-container">
                </div>
            </Panel>
        ))

    .addWithInfo(
        'Modal all',
        'Tutaj opis',
        () => (
            <Panel>
                <All/>
                <div style={{width: '500px', height: '500px', position: 'relative'}} className="modal-container">
                </div>
            </Panel>
        ))
    .addWithInfo(
        'Tooltip',
        'Tutaj opis',
        () => (
            <Panel>
                <TooltipExample/>
            </Panel>
        ))
    .addWithInfo(
        'Container',
        'Tutaj opis',
        () => (
            <Panel>
                <ContainerExample/>
            </Panel>
        ))
