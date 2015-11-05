// webpack.config.js

var webpack = require('webpack');

module.exports = {
  entry: './js/specEditor/specEditor.cjsx.md',
  output: {
    path: './build', // This is where images AND js will go
    publicPath: 'http://0.0.0.0:5000', // This is used to generate URLs to e.g. images
    filename: 'bundle.js'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  resolve: {
    extensions: ['', '.js', '.cjsx', '.cjsx.md', '.coffee', '.coffee.md', '.litcoffee']
  },
  module: {
    loaders: [
      { test: /\.cjsx$/, loader: ['coffee-loader', 'cjsx-loader'] },
      { test: /\.cjsx\.md$/, loaders: ['coffee-loader?literate', 'cjsx-loader?literate'] },
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.(coffee\.md|litcoffee)$/, loader: 'coffee-loader?literate' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  },
  watchOptions: {
    poll: true
  }
};
