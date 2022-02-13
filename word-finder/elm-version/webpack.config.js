const { resolve } = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const outputDirectory = resolve(__dirname, "dist");

const elmLoader = {
  loader: "elm-webpack-loader",
  options: {
    debug: false,
    cwd: __dirname
  }
};

const loaders = [{ loader: "elm-hot-webpack-loader" }, elmLoader];

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devServer: {
    static: outputDirectory,
    port: 8000,
    hot: true
  },
  output: {
    publicPath: "/",
    path: outputDirectory,
    filename: "[name].[contenthash].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: loaders
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyPlugin({
      patterns: [{ from: path.resolve(__dirname, "src", "input.txt") }]
    }),
    new HtmlWebpackPlugin({
      title: "Longest Constructable Word Challenge"
    })
  ]
};