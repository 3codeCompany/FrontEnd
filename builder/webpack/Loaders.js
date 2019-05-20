const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var getLoaders = function(production, input) {
    console.log("Building for:");
    console.log(input.BROWSERS);

    let loaders = {
        rules: [
            {
                test: [/\.js$/, /\.es6$/, /\.tsx/, /\.ts$/],
                exclude: path.resolve(input.BASE_PATH, "node_modules"),
                loaders: [
                    {
                        loader: "babel-loader",
                        /*options: {
                                babelrc: true,
                                cacheDirectory: true,
                                exclude: /(node_modules|bower_components)/,
                                extends: require("path").join(__dirname, "/.babelrc"),
                            },*/
                        options: {
                            cacheDirectory: input.NODE_CACHE_DIR + "/babelcache",
                            retainLines: true,

                            exclude: /(node_modules|bower_components|node_modules_shared)/,
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        targets: {
                                            browsers: input.BROWSERS,
                                            node: "current",

                                        },
                                        useBuiltIns: "entry",
                                        modules: false,
                                        forceAllTransforms: production,
                                    },
                                ],
                                "@babel/preset-typescript",
                                "@babel/react",
                            ],

                            plugins: [
                                /*"transform-react-constant-elements",
                                "transform-react-inline-elements",*/
                                "@babel/plugin-syntax-jsx",
                                "@babel/plugin-syntax-dynamic-import",

                                ["@babel/proposal-class-properties", { loose: true }],
                                "@babel/proposal-object-rest-spread",
                                "react-hot-loader/babel",
                            ],
                        },
                    },
                ],
            },

            /*{
                test: [/\.tsx/, /\.ts$/],
                loaders: [
                    {
                        loader: "awesome-typescript-loader",
                        query: {
                            declaration: true,
                            configFileName: input.LOCAL_TS_CONFIG
                                ? "./tsconfig.json"
                                : path.resolve(__dirname, "./tsconfig.json"),
                            cacheDirectory: input.NODE_CACHE_DIR + "/awcache",
                            useCache: true,
                            noImplicitAny: true,
                            transpileOnly: true,
                            forceIsolatedModules: true,
                            reportFiles: [
                                "views/!**!/!*.{ts,tsx}",
                                "vendor/arrow/!**!/!*.{ts,tsx}",
                                "node_modules_shared/src/!**!/!*.{ts,tsx}",
                            ],
                            useBabel: true,
                            babelCore: "@babel/core",

                            babelOptions: {
                                babelrc: false,
                                retainLines: true,
                                //exclude: /(node_modules|bower_components)/,
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            targets: {
                                                browsers: input.BROWSERS,
                                                node: "current",
                                            },
                                            useBuiltIns: "entry",
                                            modules: false,
                                        },
                                    ],
                                    "@babel/react",
                                ],

                                plugins: [
                                    "transform-react-constant-elements",
                                    "transform-react-inline-elements",
                                    "@babel/plugin-syntax-jsx",
                                    "@babel/plugin-syntax-dynamic-import",
                                    ["@babel/proposal-class-properties", { loose: true }],
                                    "@babel/proposal-object-rest-spread",
                                    "react-hot-loader/babel",
                                ],
                            },
                        },
                    },
                ],
            },*/

            {
                test: /\.(sa|sc|c)ss$/,
                //use: "happypack/loader?id=sass"
                use: [
                    !production ? "style-loader" : MiniCssExtractPlugin.loader,
                    { loader: "css-loader", query: { sourceMap: true } },
                    { loader: "resolve-url-loader", query: { sourceMap: true } },
                    //'postcss-loader',
                    {
                        loader: "sass-loader",
                        query: {
                            sourceMap: true,
                            includePaths: ["node_modules"],
                        },
                    },
                ],
            },

            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    "file-loader?hash=sha512&digest=hex&name=./cache/[hash].[ext]",
                    {
                        loader: "image-webpack-loader",
                        query: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 4,
                            },
                            pngquant: {
                                quality: "75-90",
                                speed: 3,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: "file-loader?hash=sha512&digest=hex&name=./cache/[hash].[ext]",
            },
        ],
    };

    return loaders;
};

module.exports = getLoaders;
