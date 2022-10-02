const fs = require('fs');
const { compileTemplate } = require('@vue/compiler-sfc')
export default function svgloader() {
    return {
        name: 'svg-loader',
        enforce: 'pre',
        load(id) {
            if (id.includes('/assets/svg')) {
                const filepath = id
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
