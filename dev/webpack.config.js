const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const { VuetifyLoaderPlugin } = require('vuetify-loader')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')

const isProd = process.env.NODE_ENV === 'production'

function sassLoaderOptions (indentedSyntax = false) {
  return {
    // implementation: require('sass'),
    // additionalData: `@import "~@/_variables.scss"` + (indentedSyntax ? '' : ';'),
    sassOptions: { indentedSyntax },
  }
}

module.exports = {
  devtool: 'source-map',
  mode: isProd ? 'production' : 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules\/(?!(vuetify)\/)/
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          { loader: 'sass-loader', options: sassLoaderOptions(true) }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          { loader: 'sass-loader', options: sassLoaderOptions() }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)(\?.*)?$/,
        loader: 'url-loader',
        options: { limit: 1024 }
      }
    ]
  },
  resolve: {
    symlinks: false,
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm-bundler.js',
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['*', '.js', '.mjs', '.cjs', '.vue', '.json']
  },
  plugins: [
    new VueLoaderPlugin(),
    new VuetifyLoaderPlugin({
      styles: 'expose',
      // progressiveImages: true
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   openAnalyzer: false
    // })
  ],
  devServer: {
    static: path.resolve(__dirname, './src'),
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/index.webpack.html' },
      ],
    },
    devMiddleware: {
      index: 'index.webpack.html',
    },
  },
  performance: {
    hints: false
  },
  optimization: {
    concatenateModules: false
  }
}

if (isProd) {
  module.exports.devtool = 'source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  ])
}
