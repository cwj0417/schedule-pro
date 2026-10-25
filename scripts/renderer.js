const { join } = require('path')
const { readdirSync } = require('fs')

const entries = readdirSync(join(__dirname, '../src/renderer')).filter(f => f.endsWith('.html'))
    .map(f => join(__dirname, '../src/renderer', f))

const configFile = join(__dirname, '..', 'vite.config.mjs')

const rendererDevServer = async () => {
    // vite 6+ 只提供 ESM 入口, 需要用动态 import 加载
    const { createServer } = await import('vite')
    const { default: detect } = await import('detect-port')
    const port = await detect(3000)
    const server = await createServer({
        configFile,
        server: {
            port,
        }
    })
    await server.listen()
    return {
        port,
    }
}

const rendererBuild = async () => {
    const { build } = await import('vite')
    await build({
        configFile,
        base: '',
        build: {
            rollupOptions: {
                input: entries,
            },
            outDir: join(__dirname, '..', 'dist', 'renderer'),
        },
        mode: 'production',
    })
}

module.exports = {
    rendererDevServer,
    rendererBuild,
}
