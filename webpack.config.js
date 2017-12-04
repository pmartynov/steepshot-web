'use strict';
const webpack  = require('webpack');
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'development';

module.exports = {
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
   }
};

module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true,
            unsafe: false
        }
    })
);

