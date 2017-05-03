'use strict';

//node modules
const webpack = require('webpack');
const path = require('path');
const args = require('yargs').argv;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

//default build path
const buildPath = path.join(__dirname, './dist');

//paramètres du build npm
let isProd = args.prod  //build prod
let isDev = args.dev;   //live server webpack
let isCopy = args.copy; //job de copy des data xls

//point d'entree app
let entry = ['./src/site.js'];
let devtool;

//dev et live server
if (isDev) {
    entry.push('webpack-dev-server/client?http://0.0.0.0:8080');
    devtool = 'source-map';
}

//Définition des plugins
let plugins = [];

//mode copie data
if(isCopy){
    plugins.push(
        new CopyWebpackPlugin([
            { from: 'xls_data',to:path.join(buildPath,'/xls') }
        ])
    );
}else{
    //mode dev
    plugins.push(new ExtractTextPlugin('[name].[hash].css'),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: 'body',
        chunks: 'app'
    }));

    //mode prod
    if (isProd) {
        plugins.push(
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                mangle: true
            }),
            new webpack.optimize.OccurenceOrderPlugin()
        );
    }
}

//module export en fonction mode
if(isCopy){
    module.exports = {
        plugins: plugins,
        output: {
            filename: '[name].[hash].js'
        },
    };

}else{
    module.exports = {
        entry: entry,

        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty'
        },

        target: 'web',

        output: {
            publicPath: "",
            path: buildPath,
            filename: '[name].[hash].js'
        },

        module: {
            loaders: [
                { test: /\.json$/, loader: 'json'},
                { test: /\.js$/, exclude: /node_modules/, loader: 'babel'},
                { test: /\.scss$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!sass') },
                { test: /\.(png|jpg|ico)$/, exclude: /node_modules/, loader: 'file-loader?name=images/[name].[ext]&context=./src/images' }
            ]
        },

        externals: [
            {
                './cptable': 'var cptable'
            }
        ],
        quiet: false,
        noInfo: false,

        plugins: plugins,

        devtool: devtool,

        devServer: {
            contentBase: buildPath,
            host: '0.0.0.0',
            port: 8080
        }
    };
}



