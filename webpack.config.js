const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: process.env.BUILD_MODE,
  entry: {
    global: './src/js/global.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: process.env.BUILD_MODE === 'production',
    minimizer: [new TerserPlugin({ extractComments: false })],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  output: {
    path: path.resolve(__dirname, `${process.env.DIST_DIR}/assets`),
    filename: '[name].js',
  },
}
