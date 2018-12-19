const webpack = require("webpack");
var { resolve, basename } = require("path");
const fs = require("fs");
const HappyPack = require("happypack");
const path = require("path");


//var ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CheckerPlugin } = require("awesome-typescript-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const extractor = require("./RouteExtractor.js");

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

//require("babel-polyfill");

let configDefaults = {
    HTTPS: false,
    ANALYZE: false,
    PORT: 3000,
    USE_FRAMEWORK_OBSERVERS: true,
    LANGUAGE: "pl",
    BROWSERS: null
};

module.exports = function(input) {
    input = Object.assign(configDefaults, input);

    if (input.PRODUCTION) {
        process.env.NODE_ENV = "production";
    } else {
        process.env.NODE_ENV = "development";
    }

    if (input.BROWSERS == null) {
        input.BROWSERS = ["last 2 Chrome versions"].concat( []);
    }

    var conf = {
        context: resolve(__dirname, ""),
        devtool: input.PRODUCTION ? "cheap-module-eval-source-map" : "cheap-module-source-map", //,

        resolve: {
            extensions: [".js", ".ts", ".tsx"],
            unsafeCache: true,
            modules: ["node_modules"]
        }
    };

    const GetLoaders = require("./Loaders.js");
    conf.module = GetLoaders(input.PRODUCTION, input);

    let tmpEntry = {};
    for (let i in input.ENTRY_POINTS) {
        tmpEntry[i] = [/*'babel-polyfill',*/ input.ENTRY_POINTS[i]];
    }

    let tmp;
    let fileComponent = resolve(input.BASE_PATH, "./build/js/tmp/components-route.include.js");
    let fileSass = resolve(input.BASE_PATH, "./build/js/tmp/components.include.sass");

    if (!input.PRODUCTION) {
        conf.mode = "development";
        if (input.USE_FRAMEWORK_OBSERVERS) {
            const FileObserver = require("./FileObserver.js");
            FileObserver(input.BASE_PATH, fileComponent, fileSass);
        }

        const getDevServerConf = require("./DevServer.js");
        tmp = getDevServerConf(
            tmpEntry,
            input.PUBLIC_PATH,
            resolve(input.BASE_PATH, input.PUBLIC_PATH),
            input.BASE_PATH,
            input.HTTPS,
            input.PORT || 3000,
            input.DOMAIN,
            input.LANGUAGE,
            webpack
        );
    } else {
        conf.mode = "production";

        extractor(input.BASE_PATH, fileComponent, fileSass, true);

        const getProductionConf = require("./Production.js");
        tmp = getProductionConf(
            tmpEntry,
            input.PUBLIC_PATH,
            input.PATH,
            input.BASE_PATH,
            input.LANGUAGE,
            input.ANALYZE,
            webpack
        );
    }

    for (let i in tmp) {
        conf[i] = tmp[i];
    }


    let threads = HappyPack.ThreadPool({size: 4});

    conf.plugins = conf.plugins.concat([
        new HappyPack({
            id: "sass",
            loaders: [
                !input.PRODUCTION ? 'style-loader' : MiniCssExtractPlugin.loader,
                {loader: "css-loader", query: {sourceMap: true}},
                {loader: "resolve-url-loader", query: {sourceMap: true}},
                //'postcss-loader',
                {
                    loader: "sass-loader",
                    query: {
                        sourceMap: true,
                        includePaths: ["node_modules"],
                    },
                },
            ],

            threadPool: threads,
        }),
    ]);



    if (false) {
        var HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
        conf.plugins.push(
            new HardSourceWebpackPlugin({
                // Either an absolute path or relative to webpack's options.context.
                cacheDirectory: input.BASE_PATH + "/node_modules/.cache/hard-source/[confighash]",
                // Either an absolute path or relative to webpack's options.context.
                // Sets webpack's recordsPath if not already set.
                recordsPath: input.BASE_PATH + "/node_modules/.cache/hard-source/[confighash]/records.json",
                configHash: function(webpackConfig) {
                    // node-object-hash on npm can be used to build this.
                    return require("node-object-hash")({ sort: false }).hash(webpackConfig) + input.LANGUAGE;
                },
                // Either false, a string, an object, or a project hashing function.
                environmentHash: {
                    root: process.cwd(),
                    directories: [],
                    files: ["package-lock.json", "yarn.lock"]
                }
            })
        );
    }

    conf.plugins.push(new webpack.PrefetchPlugin(input.BASE_PATH + "/build/js/app.tsx"));
    conf.plugins.push(new webpack.PrefetchPlugin(input.BASE_PATH + "/build/js/App.sass"));

    /*   conf.plugins.push(new RuntimeAnalyzerPlugin({
        // Can be `standalone` or `publisher`.
        // In `standalone` mode analyzer will start rempl server in exclusive publisher mode.
        // In `publisher` mode you should start rempl on your own.
        mode: 'standalone',
        // Port that will be used in `standalone` mode to start rempl server.
        // When set to `0` a random port will be chosen.
        port: 81,
        // Automatically open analyzer in the default browser. Works for `standalone` mode only.
        open: false,
        // Use analyzer only when Webpack run in a watch mode. Set it to `false` to use plugin
        // in any Webpack mode. Take into account that a building process will not be terminated
        // when done since the plugin holds a connection to the rempl server. The only way
        // to terminate building process is using `ctrl+c` like in a watch mode.
        //watchModeOnly: true
    }));
*/

    if (input.PRODUCTION) {
        conf.plugins.push(
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "bundle-[hash].css",
                chunkFilename: "[id].[hash].css"
            })
        );

        conf.optimization = {
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true // set to true if you want JS source maps
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: { "postcss-safe-parser": true, discardComments: { removeAll: true }, zindex: false }
                })
            ]
            /*splitChunks: {
                chunks: 'all'
            },*/
        };
    }else{
        //incremental build optymalization
        conf.optimization = {
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false,
        }
        /*conf.output = {
            pathinfo: false
        }*/
    }

    conf.plugins.push(function() {
        this.plugin("done", function(stats) {
            var stats = stats.toJson();
            //console.log(stats.warnings);

            let missingLang = {};
            if (stats.warnings && stats.warnings.length) {
                for (let i in stats.warnings) {
                    let el = "" + stats.warnings[i];
                    if (el.indexOf("Missing localization: ") != -1) {
                        let lines = ("" + el).split("\n");
                        for (let x = 0; x < lines.length; x++) {
                            if (lines[x].indexOf("Missing localization: ") == 0) {
                                missingLang[lines[x].replace("Missing localization: ", "")] = "";
                            }
                        }
                    }
                }

                fs.writeFile(
                    resolve(input.BASE_PATH, `./build/js/tmp/missing-${input.LANGUAGE}-lang.json`),
                    JSON.stringify(missingLang, null, 2),
                    function() {}
                );
            }

            return true;
        });
    });

    return conf;
};
