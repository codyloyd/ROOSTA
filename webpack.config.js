const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(mp3|wav|png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
    ],
  },
};
