import React from 'react';
import {storiesOf} from '@storybook/react';
import {action, decorateAction} from '@storybook/addon-actions';
import Panel from '../../src/ctrl/Panel';
import {BForm, BText, BSwitch, BSelect, BCheckboxGroup, BTextarea, BButtonsBar} from '../../src/layout/BootstrapForm'
import {Text, Switch, Select, CheckboxGroup, Textarea, Date, Wysiwyg} from '../../src/ctrl/Fields'


const formImport = `
        ~~~js
        import { Text, Switch, Select, CheckboxGroup, Textarea } from "frontend/lib/ctrl/Fields"
        ~~~
        `;

storiesOf('Fields', module)
    .addWithInfo(
        'All fields',
        'Tutaj opis',
        () => (
            <Panel>
                <table className="storyTable">
                    <tbody>
                    <tr>
                        <td>Text</td>
                        <td><Text value="Test text value"/></td>
                    </tr>
                    <tr>
                        <td>Switch</td>
                        <td><Switch options={{1: 'One', 2: 'Two', 3: 'Three'}} value="2"/></td>
                    </tr>
                    <tr>
                        <td>Select [options as object]</td>
                        <td><Select options={{1: 'One', 2: 'Two', 3: 'Three'}} value="3"/></td>
                    </tr>
                    <tr>
                        <td>Select [options as array]</td>
                        <td><Select options={[
                            {value: 1, label: 'One'},
                            {value: 2, label: 'Two'},
                            {value: 3, label: 'Three'},

                        ]} value={2}/></td>
                    </tr>
                    <tr>
                        <td>CheckboxGroup [options as object]</td>
                        <td><CheckboxGroup options={{1: 'One', 2: 'Two', 3: 'Three'}} value={['2', '3']}/></td>
                    </tr>
                    <tr>
                        <td>CheckboxGroup [options as array]</td>
                        <td><CheckboxGroup options={[
                            {value: 1, label: 'One'},
                            {value: 2, label: 'Two'},
                            {value: 3, label: 'Three'},

                        ]} value={['2', '3']}/></td>
                    </tr>
                    <tr>
                        <td>Textarea</td>
                        <td><Textarea value={'Test of text\n input\nanother line'}/></td>
                    </tr>
                    <tr>
                        <td>Date</td>
                        <td><Date value="2008-11-11"/></td>
                    </tr>
                    <tr>
                        <td>Wysiwyg</td>
                        <td><Wysiwyg value="2008-11-11"/></td>
                    </tr>
                    </tbody>
                </table>
            </Panel>
        ))
