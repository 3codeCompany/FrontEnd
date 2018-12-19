import React from 'react';
import { storiesOf } from '@storybook/react'
import Panel from '../../src/ctrl/Panel';
import {GalleryBase} from './galery';


storiesOf('FilesLists', module)
    .addWithInfo(
        'Galery', "",

        () => (
            <Panel>

                <GalleryBase/>

            </Panel>
        ))