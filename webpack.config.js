const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = ({ mode, dist }) => ({
  mode: mode || 'production',
  entry: {
    theme: './src/js/theme.js',
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
    minimize: mode ? mode === 'production' : true,
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
    path: path.resolve(__dirname, `${dist}/assets`),
    filename: '[name].min.js',
  },
})
