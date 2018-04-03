const webpack = require('webpack')
const path = require('path')
//const CreateFileWebpack = require('create-file-webpack')
//const ExtractTextPlugin = require('extract-text-webpack-plugin')
//const _ = require('lodash')

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


// if (git_rev.isTagDirty()) {
//   if (process.env.TRAVIS_BRANCH !== undefined) {
//     // On Travis-CI, the git branches are detached so use env variable instead
//     APP_VERSION_STRING = process.env.TRAVIS_BRANCH
//   } else {
//     APP_VERSION_STRING = git_rev.branch()
//   }
// } else {
//   APP_VERSION_STRING = git_rev.tag()
// }

const APP_DIR = path.resolve(__dirname, 'src/')
// let BUILD_DIR = path.resolve(__dirname, 'dist/')

let APP_PATH_STRING
let CSS_PATH_STRING

//const htmlTemplateCompiler = _.template(htmlTemplate)

// const config
module.exports = (env) => {
  let plugins = []
  if (env === 'prod') {
    BUILD_DIR = path.resolve(__dirname, 'prod/')
    // if (git_rev.isTagDirty()) {
    //   APP_PATH_STRING = ''
    // } else {
    //   APP_PATH_STRING = ''
    // }
    plugins.push(new UglifyJsPlugin())
    CSS_PATH_STRING = APP_PATH_STRING
  } else if (env === 'dev') {
    BUILD_DIR = path.resolve(__dirname, 'dev/')
    APP_VERSION_STRING = 'dev'
    APP_PATH_STRING = ''
    CSS_PATH_STRING = ''
  }

  return {
    entry: `${APP_DIR}/ply.js`,
    mode: 'development',
    output: {
      path: BUILD_DIR,
      filename: `ply.js`,
      library: 'Ply',
      libraryTarget: 'umd',
      libraryExport: 'default'
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js?$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {
            // eslint options (if necessary)
            emitWarning: true,
            emitError: true,
            extensions: ['.js']
          },
        },
      ]},
    watchOptions: { poll: true },
    plugins
  }
}

// module.exports = config
