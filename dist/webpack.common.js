var path = require("path");
var fs = require("fs");
var NodemonPlugin = require("nodemon-webpack-plugin");
var nodeModules = {};
fs.readdirSync("node_modules")
    .filter(function (x) {
    return [".bin"].indexOf(x) === -1;
})
    .forEach(function (mod) {
    nodeModules[mod] = "commonjs " + mod;
});
module.exports = {
    entry: "./src/launch/start",
    target: "node",
    devtool: "source-map",
    externals: nodeModules,
    plugins: [new NodemonPlugin()],
    output: {
        path: path.join(__dirname, "dist"),
        filename: "app.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: "ts-loader"
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        modules: ["node_modules"]
    }
};
