import React from 'react';
import {BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar, BDate, BFile} from '../../src/layout/BootstrapForm'
import {Text} from '../../src/ctrl/Fields'

class FunctionRender extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                textarea: 'initial data',
                other: 'static value'
            },
            submit: {}
        };
    }


    render() {

        return (
            <div>
                <BForm
                    data={this.state.data}
                    onChange={(data) => {
                        let d = data.form.getData();
                        this.setState({data: d});
                    }}
                >{(c) => {

                    return (
                        <div>

                            <table style={{width: '100%'}} className="table">
                                <tbody>
                                <tr>
                                    <td>
                                        <BText label="Text" name="text"  {...c('text')} />
                                    </td>
                                    <td>
                                        <Text label="Text" name="text"  {...c('text')} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <BSelect name="select" label="Select" options={{1: 'One', 2: 'Two', 3: 'Three'}} {...c('select')} />
                                    </td>
                                    <td>
                                        <BCheckboxGroup name="checkboxGroup" label="Checkbox group" options={{1: 'One', 2: 'Two', 3: 'Three'}} {...c('checkboxGroup')}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <BTextarea name="textarea" label="Checkbox group" {...c('textarea')} />


                                    </td>
                                    <td>
                                        <BDate name="date" label="Date"  {...c('date')}  />
                                    </td>
                                </tr>

                                </tbody>
                            </table>
                            <input type="submit" value="submit" className="btn btn-primary" onClick={(e) => this.setState({submit: this.refs.form.getData()})}/>
                        </div>
                    );
                }}
                </BForm>
                <h5>Current data</h5>
                <pre>
                    {JSON.stringify(this.state.data, null, 2)}
                </pre>
                <h5>Submited data</h5>
                <pre>
                    {JSON.stringify(this.state.submit, null, 2)}
                </pre>

            </div>

        )
    }
}

export {FunctionRender};