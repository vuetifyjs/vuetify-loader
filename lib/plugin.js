const webpack = require('webpack')

let VuetifyLoaderPlugin = null

if (webpack.version[0] > 4) {
    // webpack5 and upper
    VuetifyLoaderPlugin = require('./plugin-webpack5')
} else {
     // webpack4 and lower
    VuetifyLoaderPlugin = require('./plugin-webpack4')
}

module.exports = VuetifyLoaderPlugin
