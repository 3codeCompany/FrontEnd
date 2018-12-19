// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add addional webpack configurations.
// For more information refer the docs: https://getstorybook.io/docs/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const path = require('path');
module.exports = {

    plugins: [
        // your custom plugins
    ],
    devServer: {
        publicPath: "/",
    },
    devtool: '#cheap-module-eval-source-map',
    /*resolve: {
        modules: [path.resolve(__dirname, '../node_modules')]
    },*/
    module: {
        rules: [
            {test: /\.tsx?$/, loaders: [/*'react-hot-loader/webpack',*/ 'awesome-typescript-loader']},
            {
                test: /\.css/,
                loaders: [
                    "style-loader",
                    {loader: "css-loader", query: {sourceMap: true}},
                ]
            },
            {
                test: /\.sass/,
                loaders: [
                    "style-loader",
                    {loader: "css-loader", query: {sourceMap: true}},
                    'resolve-url-loader',
                    {
                        loader: "sass-loader",
                        query: {
                            sourceMap: true,
                            includePaths: [path.resolve(__dirname, '../node_modules')]
                        }
                    }
                ],
                include: path.resolve(__dirname, '../')
            },

            {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff"},
            {test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader"}
        ],

    },
    resolve: {
        extensions: ['.js', '.es6', '.ts', '.tsx']
    }
};

