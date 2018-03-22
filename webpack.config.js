const webpack = require('webpack')
const path = require('path')
//const CreateFileWebpack = require('create-file-webpack')
//const ExtractTextPlugin = require('extract-text-webpack-plugin')
//const _ = require('lodash')


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

let BUILD_DIR = path.resolve(__dirname, 'dist/')

let APP_PATH_STRING
let CSS_PATH_STRING

//const htmlTemplateCompiler = _.template(htmlTemplate)

// const config
module.exports = (env) => {

  return {
    entry: `${APP_DIR}/ply.js`,
    mode: 'development',
    output: {
      path: BUILD_DIR,
      filename: `ply.js`,
      library: 'ply',
      libraryTarget: 'umd'
    },
    watchOptions: { poll: true }
  }
}

// module.exports = config
