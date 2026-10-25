import vue from '@vitejs/plugin-vue'
import svg from './scripts/plugins/rollup-plugins-svg.mjs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default {
  root: join(__dirname, './src/renderer'),
  // base: '', // has to set to empty string so the html assets path will be relative
  plugins: [vue(), svg()],
  resolve: {
    alias: {
      '@': join(__dirname, './src/renderer'),
    }
  }
}
