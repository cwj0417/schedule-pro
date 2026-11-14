const { join } = require('path')
const { remove } = require('fs-extra')

const projRoot = join(__dirname, '..')

// 每张卡片单独构建: 多入口共享 chunk 时 singlefile 无法把公共 JS 内联进 HTML,
// 而宿主 iframe 只能拿到单个 HTML 文本, 引用外部文件会加载失败
const CARDS = ['schedule', 'inspiration', 'timers', 'stickies', 'settings']

const mcpAppsBuild = async () => {
    const { build } = await import('vite')
    const { default: vue } = await import('@vitejs/plugin-vue')
    const { viteSingleFile } = await import('vite-plugin-singlefile')

    const outDir = join(projRoot, 'dist', 'mcp-apps')
    await remove(outDir)

    for (const card of CARDS) {
        await build({
            configFile: false,
            root: join(projRoot, 'src', 'mcp-apps'),
            base: '',
            publicDir: false,
            plugins: [vue(), viteSingleFile()],
            build: {
                outDir,
                emptyOutDir: false,
                rollupOptions: {
                    input: { [card]: join(projRoot, 'src', 'mcp-apps', `${card}.html`) },
                },
            },
        })
    }
}

module.exports = {
    mcpAppsBuild,
}

if (require.main === module) {
    mcpAppsBuild().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
