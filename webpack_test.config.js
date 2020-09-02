const path = require('path');

module.exports = {
  entry: './src/LetterCasePlugin.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'LetterCasePlugin.js'
  }
};