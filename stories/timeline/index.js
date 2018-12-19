import React from 'react';
import { storiesOf } from '@storybook/react'
import {Timeline, TimelineItem} from '../../src/ctrl/Timeline';
import Panel from '../../src/ctrl/Panel';

const importInfo = `
        ~~~js
        import {Timeline, TimelineItem} from "frontend/lib/ctrl/Timeline"
         ~~~
         `;


storiesOf('Timeline', module)
    .addWithInfo('Base', importInfo, () => (
        <Panel>
            <Timeline>
                <TimelineItem time="2017-01-02" action="Action 1" user="Admin">Tutaj treść</TimelineItem>
                <TimelineItem time="2017-01-02" action="Action 2" user="Ramus">Tutaj treść</TimelineItem>
            </Timeline>
        </Panel>

    ))
    .addWithInfo('Colors', importInfo, () => (
        <Panel>
            <Timeline>
                <TimelineItem color="red" time="2017-01-02" user="admin@admin.com" action="Update"></TimelineItem>
                <TimelineItem color="green" time="2017-01-02" user="Rammus" action="create"></TimelineItem>
            </Timeline>
        </Panel>

    )).addWithInfo('Icons', importInfo, () => (
    <Panel>
        <Timeline>
            <TimelineItem color="red" time="2017-01-02" user="admin@admin.com" action="Update" icon="envelope"></TimelineItem>
            <TimelineItem color="green" time="2017-01-02" user="Rammus" action="create" icon="plus-circle"></TimelineItem>
        </Timeline>
    </Panel>

))