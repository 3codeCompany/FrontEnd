import React from 'react';
import {BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar, BDate, BFile} from '../../src/layout/BootstrapForm'

 class DataBinding extends React.Component {

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
            <BForm
                data={this.state.data}
                onChange={(data) => {
                    let d = data.form.getData();
                    this.setState({data: {...d, 'textarea': d.text + ' x1' }});


                }}
                ref="form"
            >
                <BText label="Text" name="text"  disabled={true} />
                <BSelect name="select" label="Select" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                <BCheckboxGroup name="checkboxGroup" label="Checkbox group" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                <BTextarea name="textarea" label="Checkbox group"/>
                <BDate name="date" label="Date"/>

                <input type="submit" value="submit" className="btn btn-primary" onClick={(e) => this.setState({submit: this.refs.form.getData()})}/>
                <div>
                    <input type="text" onChange={(e) => this.setState({data: {...this.state.data, external: e.target.value}})}/>
                </div>
                <h5>Current data</h5>
                <pre>
                    {JSON.stringify(this.state.data, null, 2)}
                </pre>
                <h5>Submited data</h5>
                <pre>
                    {JSON.stringify(this.state.submit, null, 2)}
                </pre>
            </BForm>
        )
    }
}

export  {DataBinding};