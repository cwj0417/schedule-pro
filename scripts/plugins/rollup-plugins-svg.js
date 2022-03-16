const fs = require('fs');
const path = require('path');
const { compileTemplate } = require('@vue/compiler-sfc')
export default function svgloader() {
    return {
        name: 'svg-loader',
        enforce: 'pre',
        resolveId(source) {
            if (source.includes('/assets/svg')) {
                return source;
            }
            return null;
        },
        load(id) {
            if (id.includes('/assets/svg')) {
                const filepath = path.join(__dirname, '../../src/renderer', id)
                const file = fs.readFileSync(filepath, 'utf-8');
                const { code } = compileTemplate({
                    id: JSON.stringify(id),
                    source: file,
                    filename: filepath,
                    transformAssetUrls: false
                })
                return `${code}\nexport default { render }`
            }
            return null;
        }
    };
}