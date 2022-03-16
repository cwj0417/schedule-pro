const vue = require('@vitejs/plugin-vue')
const svg = require('./scripts/plugins/rollup-plugins-svg').default
const { join } = require('path')


module.exports = {
  root: join(__dirname, './src/renderer'),
  // base: '', // has to set to empty string so the html assets path will be relative
  plugins: [vue(), svg()],
  resolve: {
    alias: {
      '@': join(__dirname, './src/renderer')
    }
  }
}
