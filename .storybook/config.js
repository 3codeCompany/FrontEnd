import React from 'react';
import {configure, setAddon, addDecorator} from '@storybook/react';
import infoAddon from '@storybook/addon-info';



setAddon(infoAddon);

function loadStories() {
    require('../stories/index');

}

configure(loadStories, module);


