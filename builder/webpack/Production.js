//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const fs = require('fs');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


var getProductionConf = function (ENTRY_POINTS, PUBLIC_PATH, PATH, BASE_PATH, LANGUAGE, ANALYZE, webpack) {
    conf = {};
    conf.entry = ENTRY_POINTS;
    conf.output = {
        filename: `bundle-${LANGUAGE}-[id]-[hash].min.js`,
        chunkFilename: `chunk-[name]-${LANGUAGE}-[hash].bundle.js`,
        path: PATH,
        publicPath: PUBLIC_PATH
    };
    conf.plugins = [
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        //new ExtractTextPlugin({filename: 'bundle-[hash].css', allChunks: true}),


        new webpack.DefinePlugin({
            "PRODUCTION": JSON.stringify(true),
            LANGUAGE: JSON.stringify(LANGUAGE),
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),

        new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(pl)$/),

        //new webpack.optimize.OccurrenceOrderPlugin(),


    ];
    if (ANALYZE) {
        conf.plugins.push(new BundleAnalyzerPlugin());
    }

    conf.plugins.push(
        function () {
            this.plugin("after-emit", function (compilation, callback) {
                var stats = compilation.getStats().toJson();
                if (stats) {
                    let content = stats.assetsByChunkName.admin[1] + "|" + compilation.getStats().hash
                    fs.writeFile(PATH + `/compilation-hash-${LANGUAGE}.txt`, content, function () {
                        callback();
                    });
                }
            })
        }
    );


    return conf;

};


module.exports = getProductionConf;
