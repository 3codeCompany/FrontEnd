import React from 'react';
import {storiesOf} from '@storybook/react';
import {action, decorateAction} from '@storybook/addon-actions';
import Panel from '../../src/ctrl/Panel';
import {BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar, BDate, BFile, BWysiwig} from '../../src/layout/BootstrapForm'
import {DataBinding} from './DataBinding'
import {FunctionRender} from './FunctionRender'
import FileUpload from './FileUpload'
import SurroundElements from './SurroundElements'


const formImport = `
        ~~~js
        import { BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar, BDate } from "frontend/lib/layout/BootstrapForm"
        ~~~
        `;

storiesOf('Bootstrap Forms', module)
    .addWithInfo(
        'Base ( layouts )',

        formImport,
        () => (
            <div style={{maxWidth: '800px'}}>
                <Panel key="1">
                    <BForm
                        editable={true}
                        data={{
                            text: 'xxx',
                            select: '2',
                            switch: '2',
                            checkboxGroup: [2, 3],
                            textarea: 'Some lorem ipsum text',
                            date: '2008-11-11'
                        }}
                    >
                        <BText label="Text" name="text"/>
                        <BSelect name="select" label="Select" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                        <BCheckboxGroup inline name="checkboxGroup" label="Checkbox group" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                        <BSwitch inline name="switch" label="Radio group" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                        <BTextarea name="textarea" label="Textarea"/>
                        <BDate name="date" label="Date"/>
                        <BFile name="file" label="File"/>
                        <BWysiwig name="wysiwig" label="Wysiwig"/>
                        <input type="submit" value="submit" className="btn btn-primary"/>
                    </BForm>
                </Panel>
                <Panel key="2"


                >
                    <BForm layoutType="horizontal"

                           editable={false}
                           data={{
                               text: 'xxx',
                               select: '2',
                               switch: '2',
                               checkboxGroup: [2, 3],
                               textarea: 'Some lorem ipsum text',
                               date: '2008-11-11'
                           }}
                    >
                        <BText label="Text" name="text"/>
                        <BSelect name="select" label="Select" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                        <BCheckboxGroup name="checkboxGroup" label="Checkbox group" options={{1: 'One', 2: 'Two', 3: 'Three'}}/>
                        <BTextarea name="textarea" label="Textarea"/>
                        <BDate name="date" label="Date"/>
                        <BFile name="file" label="File"/>
                        <BButtonsBar>
                            <input type="submit" value="submit" className="btn btn-primary"/>
                        </BButtonsBar>
                    </BForm>
                </Panel>
            </div>
        ))
    .addWithInfo(
        'Data Binding',
        formImport
        ,
        () => (
            <div style={{maxWidth: '800px'}}>
                <Panel>
                    <DataBinding/>
                </Panel>

            </div>
        ))
    .addWithInfo(
        'File upload',
        formImport
        ,
        () => (
            <div style={{maxWidth: '800px'}}>
                <Panel>
                    <FileUpload/>
                </Panel>

            </div>
        ))
    .addWithInfo(
        'FunctionRender',
        formImport
        ,
        () => (
            <div style={{maxWidth: '800px'}}>
                <Panel>
                    <FunctionRender/>
                </Panel>

            </div>
        ))
    .addWithInfo(
        'Surround elements',
        formImport
        ,
        () => (
            <div style={{maxWidth: '800px'}}>
                <Panel>
                    <SurroundElements/>
                </Panel>

            </div>
        ))

