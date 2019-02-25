var webpack = require("webpack");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var WriteFilePlugin = require("write-file-webpack-plugin");
var path = require("path");

module.exports = {
    entry: "main",
    output: {
        filename: "double-golf-man.js",
        path: path.join(__dirname, "./dist")
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.less$/, loader: "raw-loader" },
            { test: /\.txt$/, loader: "raw-loader" }
        ]
    },
    plugins: [
        new WriteFilePlugin(),
        new CopyWebpackPlugin([
            {
                from: "src/assets",
                to: "assets",
            },
            {
                from: "src/index.html",
                to: "index.html",
            }
        ]),
        new webpack.ProvidePlugin({
            PIXI: "pixi.js",
            TWEEN: "tween.js"
        })
    ],
    resolve: {
        extensions: [
            ".js",
            ".ts",
            ".less",
            ".txt"
        ],
        modules: [
            "src",
            "src/styles",
            "node_modules",
        ]
    },
    devtool: "source-map"
};
