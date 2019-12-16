const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");


const config = {
    mode: "production",


    output: {
        path: path.resolve(__dirname, "../../website-build/dist"),
        publicPath: "/",
    },
    resolve: {
        extensions: [".js", ".json", ".css", ".ts", ".tsx"],
        modules: [__dirname, "node_modules"],
    },


    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: `'production'`,
            },
        }),
    ],
    module: {
        rules: [
            {
                test: [/\.js$/, /\.es6$/, /\.tsx/, /\.ts$/],
                loader: "babel-loader",
                options: {
                    babelrc: false,
                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                targets: {
                                    browsers: ["last 1 Chrome versions", "last 1 Firefox versions", "last 1 Edge versions"],
                                    node: "current",

                                },
                                useBuiltIns: "entry",
                                modules: false,
                                forceAllTransforms: true,
                            },
                        ],
                        "@babel/preset-typescript",
                        "@babel/react",
                    ],
                    plugins: [
                        /*"transform-react-constant-elements"*/,
                        /*"transform-react-inline-elements",*/
                        "@babel/plugin-syntax-jsx",
                        "@babel/proposal-class-properties",
                        "@babel/proposal-object-rest-spread",
                        "@babel/plugin-syntax-dynamic-import",


                    ],
                },

            },
        ],
    },
};

const serverConfig = {
    ...config,
    entry: { server: path.resolve(__dirname, "src/server.tsx") },
    target: "node",

    node: {
        __dirname: false,
        __filename: false,
    },
    externals: nodeExternals(),
    //…
};


module.exports = serverConfig; //[/*serverConfig,*/ clientConfig];