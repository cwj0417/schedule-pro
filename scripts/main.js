const { join } = require('path')
const { build, transformSync } = require('esbuild')
const { writeFileSync, readFileSync, ensureDirSync } = require('fs-extra')

let devPlugin = port => ({
    name: 'dev',
    setup(build) {
        build.onResolve({ filter: /^@\/renderer\/.*$/ }, args => ({
            path: args.path,
            namespace: 'dev-html',
        }))
        build.onLoad({ filter: /.*/, namespace: 'dev-html' }, args => {
            const path = args.path.slice(10)
            return {
                contents: `http://localhost:${port}${path}`,
                loader: 'text',
            }
        })
    },
})

let prodPlugin = () => ({
    name: 'prod',
    setup(build) {
        build.onResolve({ filter: /^@\/renderer\/.*$/ }, args => ({
            path: args.path,
            namespace: 'dev-html',
        }))
        build.onResolve({ filter: /^url$|^path$/ }, args => {
            return {
                external: true
            }
        })
        build.onLoad({ filter: /.*/, namespace: 'dev-html' }, (args) => {
            const path = args.path.slice(10).split('#')
            return {
                contents: `module.exports = require('url').pathToFileURL(require('path').join(__dirname, '..', 'renderer', '${path[0]}')).toString() + '#${path[1]}';`,
                loader: 'js',
            }
        })
    },
})

let devPreloadPlugin = () => ({
    name: 'preload',
    setup(build) {
        build.onResolve({ filter: /^@\/preload\/.*$/ }, args => ({
            path: args.path,
            namespace: 'preload',
        }))
        build.onLoad({ filter: /.*/, namespace: 'preload' }, args => {
            const path = join(__dirname, '../src/main/preload', args.path.slice(9))
            const file = readFileSync(path).toString()
            const contents = transformSync(file, {
                loader: 'ts'
            }).code
            return {
                contents,
                loader: 'file',
            }
        })
    }
})

let prodPreloadPlugin = () => ({
    name: 'preload',
    setup(build) {
        build.onResolve({ filter: /^@\/preload\/.*$/ }, args => ({
            path: args.path,
            namespace: 'preload',
        }))
        build.onLoad({ filter: /.*/, namespace: 'preload' }, args => {
            const path = join(__dirname, '../src/main/preload', args.path.slice(9))
            const file = readFileSync(path).toString()
            const contents = transformSync(file, {
                loader: 'ts'
            }).code
            ensureDirSync(join(__dirname, '../dist/main')) // 这里有点拼拼凑凑了. 能用就先不重构了, 等esbuild正式版
            writeFileSync(join(__dirname, '../dist/main', args.path.slice(9)), contents)
            return {
                contents: `import { join } from 'path'; export default join(__dirname, '../main', '${args.path.slice(9)}')`,
                loader: 'js',
            }
        })
    }
})

const mainDevServer = async (port, onChange = () => { }) => {
    await build({
        entryPoints: [join(__dirname, '..', 'src/main/index.ts')],
        outfile: 'dist/main/index.js',
        bundle: true, // 如果false就不会处理文件里的import
        platform: 'node',
        plugins: [devPlugin(port), devPreloadPlugin()], // 替换入口
        external: ['electron'], // 加了以后打包会直接require('electron') 而不是去尝试resolve, 会导致应用起不起来
        watch: {
            onRebuild(error, result) {
                if (error) console.error('watch build failed:', error)
                else onChange()
            },
        },
        publicPath: join(__dirname, '../dist/main'),
    })
}

const mainProdBuild = async () => {
    await build({
        entryPoints: [join(__dirname, '..', 'src/main/index.ts')],
        outfile: 'dist/main/index.js',
        bundle: true, // 如果false就不会处理文件里的import
        platform: 'node',
        plugins: [prodPlugin(), prodPreloadPlugin()], // 替换入口
        external: ['electron'], // 加了以后打包会直接require('electron') 而不是去尝试resolve, 会导致应用起不起来
        publicPath: join(__dirname, '../dist/main'),
    })
}

module.exports = {
    mainDevServer,
    mainProdBuild,
}
