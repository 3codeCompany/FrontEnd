import React from 'react';
import {BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar, BDate, BFile, withBootstrapFormField} from '../../src/layout/BootstrapForm'

export default class FileUpload extends React.Component {

    constructor(props) {
        super(props);





        this.state = {
            data: {
                file2: [
                    {"name": 'xxx', "type": 'xxx', path: 'xxx'}
                ]
            },
            submit: {},
            response: {}

        };
    }

    handleFileChange(e) {

        this.state.data.files = e.target.files

        this.setState({});
        return true;


    }

    render() {


        const server = 'http://localhost:3001';

        let OInput = withBootstrapFormField((props) => <input type="file" {...props} onChange={this.handleFileChange.bind(this)}/>, false)

        return (
            <BForm
                action={server + '/form/fileUpload'}
                data={this.state.data}

                onChange={(data) => {
                    this.setState({data: data.form.getData()});
                }}
                onSuccess={(data) => {
                    this.setState({response: data.response});
                }}
                ref="form"
                layoutType="horizontal"
            >
                <BText label="Text" name="text"/>
                <BText label="Text" name="text[xxx]"/>

                <OInput/>

                <BFile label="Plik 1" name="file2"/>


                <input type="submit" value="submit" className="btn btn-primary" onClick={(e) => this.setState({submit: this.refs.form.getData()})}/>

                <h5>Current data</h5>
                <pre>
                    {JSON.stringify(this.state.data, null, 2)}
                </pre>
                <h5>Submited data</h5>
                <pre>
                    {JSON.stringify(this.state.submit, null, 2)}
                </pre>
                <h5>Response data</h5>
                <pre>
                    {JSON.stringify(this.state.response, null, 2)}
                </pre>
            </BForm>
        )
    }
}

