const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var getLoaders = function(production, input) {
    console.log("Building for:");
    console.log(input.BROWSERS);

    const babelPlugins = [
        /*production && "@transform-react-constant-elements",
        production && "@transform-react-inline-elements",*/
        "react-hot-loader/babel",
        "@babel/plugin-syntax-jsx",
        "@babel/plugin-syntax-dynamic-import",

        "@babel/proposal-object-rest-spread",

        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator",
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        ["@babel/proposal-class-properties", { loose: false }],

    ];

    if (!production) {
        babelPlugins.push("@babel/plugin-transform-react-jsx-source");
    }

    let loaders = {
        rules: [
            
            {
                test: [/\.js$/, /\.es6$/, /\.tsx/, /\.ts$/],
                exclude: path.resolve(input.BASE_PATH, "node_modules"),
                use: [
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

                            exclude: /(node_modules|bower_components|lib\/frontend)/,
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        targets: {
                                            browsers: input.BROWSERS,
                                            //node: "current",
                                        },
                                        useBuiltIns: "entry",
                                        modules: false,
                                        forceAllTransforms: production,
                                        corejs: "3",
                                    },
                                ],
                                "@babel/preset-typescript",
                                "@babel/react",
                            ],
                            sourceMap: "both",

                            plugins: babelPlugins,
                        },
                    },
                ],
            },

            /*            {
                            test: /\.(js|map)$/,
                            use: ["source-map-loader"],
                            enforce: "pre",
                        },*/

            {
                test: /module\.sass$/,

                use: [
                    !production ? "style-loader" : MiniCssExtractPlugin.loader,
                    
                    { loader: "css-loader", options: { sourceMap: !production, modules: true } },
                    { loader: "resolve-url-loader", options: { sourceMap: !production } },
                    //'postcss-loader',
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: !production,
                            sassOptions: { includePaths: ["node_modules"], quietDeps: true },

                        },
                    },
                ],
            },

            {
                test: /\.(sa|sc|c)ss$/,
                exclude: (el) => {
                    //exclude modules
                    if (el.indexOf("module.") !== -1) {
                        return true;
                    }
                    return false;
                },
                use: [
                    !production ? "style-loader" : MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { sourceMap: !production } },
                    { loader: "resolve-url-loader", options: { sourceMap: !production } },
                    //'postcss-loader',
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: !production,
                            sassOptions: { includePaths: ["node_modules"] },
                        },
                    },
                ],
            },

            /*{
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
            },*/
            {
                test: /\.(jpe?g|png|gif|svg|ttf|eot|woff|woff2)$/,
                use: ["file-loader?hash=sha512&digest=hex&name=./cache/[hash].[ext]"],
            },
        ],
    };

    return loaders;
};

module.exports = getLoaders;
