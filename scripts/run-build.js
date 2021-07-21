const builder = require("electron-builder")
const Platform = builder.Platform
const { join } = require('path')
const { stat, remove, writeFile, copyFile } = require('fs-extra')
const { rendererBuild } = require('./renderer')
const { mainProdBuild } = require('./main')

const projRoot = join(__dirname, '..')

const runBuild = async () => {

    // 清理dist和built
    await remove(join(projRoot, 'build', 'built'))
    await remove(join(projRoot, 'dist', 'renderer'))
    await remove(join(projRoot, 'dist', 'main'))

    // vite(rollup)打包renderer进程
    await rendererBuild()
    
    // esbuild打包main进程
    await mainProdBuild()

    // 写入package.json
    const packageJson = require(join(projRoot, 'package.json'))
    writeFile(join(projRoot, 'dist', 'package.json'), JSON.stringify(packageJson))

    // build electron
    builder.build({
        targets: Platform.MAC.createTarget(),
        config: require(join(projRoot, 'build', 'config.js')),
        publish: 'always',
        // dir: true,
    })
        .then(() => {
            console.log('done')
        })
        .catch((error) => {
            console.log('err', error);
        })
}

runBuild()
