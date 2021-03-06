/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/ 
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const copyright = 
`Copyright (c) 2017, Neap Pty Ltd.
All rights reserved.
 
This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.`

const env = process.env.WEBPACK_ENV;
const outputfilename = "graphx";
const { plugins, outputfile } = env == "build" 
    ? { plugins: [new UglifyJSPlugin(), new webpack.BannerPlugin(copyright)], outputfile: `${outputfilename}.min.js` } 
    : { plugins: [new webpack.BannerPlugin(copyright)], outputfile: `${outputfilename}.js` } 

module.exports = {
    entry: [
        `./src/${outputfilename}.js`
    ],
    output: {
        path: __dirname + '/lib',
        filename: outputfile,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [{
            loader: "babel-loader",
            exclude: [
                path.resolve(__dirname, "node_modules")
            ],
            // Only run `.js` and `.jsx` files through Babel
            test: /\.jsx?$/,
            // Options to configure babel with
            query: {
                plugins: ['transform-runtime'],
                presets: ['es2015'],
            }
        }, ]
    },
    devtool: 'source-map',
    plugins: plugins
};
