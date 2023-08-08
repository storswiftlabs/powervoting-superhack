const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  target:'web',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'index_bundle.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback:{
      "path":require.resolve("path-browserify"),
      "os":require.resolve("os-browserify"),
      "fs":require.resolve("browserify-fs")
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      })
    ]
  },
  devServer: {
    static: path.join(__dirname, 'public'),
    port: 3001,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://192.168.10.150:8888',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      },
      '/mainnet': {
        target: 'http://162.219.87.219:1234',
        changeOrigin: true,
        pathRewrite: {
          '^/mainnet': ''
        }
      },
    }
  },
  stats: {
    warningsFilter: [
      /Failed to parse source map from/,
    ],
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      },
    ],
  },
  plugins: [
    new Dotenv({
      path:"./.env"
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/images',
          to: 'images'
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devtool: 'source-map',
};