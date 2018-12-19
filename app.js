import ReactDOM from 'react-dom'
import React from 'react'
import PanelComponentLoader from './src/lib/PanelComponentLoader'

require('./src/lib/react-helper.tsx');

global.ReactDOM = ReactDOM;
global.React = React;


ReactHelper.register('PanelComponentLoader', PanelComponentLoader);

ReactHelper.initComponents();

if (module.hot) {
    module.hot.accept();
}


