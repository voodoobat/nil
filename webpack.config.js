const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (mode) => ({
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
    minimize: mode === 'production',
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
    path: path.resolve(__dirname, 'public/assets'),
    filename: '[name].min.js',
  },
})
