const { join } = require('path')

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  productName: 'schedule-pro',
  appId: 'com.cwj.schedule-pro',
  copyright: 'chenwj',
  electronVersion: process.env.ELECTRON_VERSION, // only used for development debugging
  // 产物文件名不带版本号, 固定为 schedule-pro-{arch}.{ext},
  // 这样 releases/latest/download/ 恒定指向最新发布的安装包
  artifactName: '${productName}-${arch}.${ext}',
  directories: {
    output: 'build/built',
    buildResources: 'build',
    app: 'dist'
  },
  // assign publish for auto-updater
  // set this to your own repo!
  publish: [{
    provider: 'github',
    owner: 'cwj0417',
    repo: 'schedule-pro',
    releaseType: 'release'
  }],
  files: [
    // don't include node_modules as all js modules are bundled into production js by rollup
    // unless you want to prevent some module to bundle up
    // list them below
  ],
  nsis: {
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${productName}-Setup-${version}.${ext}',
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: true,
    differentialPackage: true
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      },
      {
        // 没有 Apple 开发者证书, 包是 ad-hoc 签名, 首次打开会被 Gatekeeper 拦截
        x: 270,
        y: 250,
        type: 'file',
        path: join(__dirname, '安装说明.txt')
      }
    ]
  },
  mac: {
    icon: 'build/icons/icon.icns', // 默认是dmg+zip, 不然autoUpdater会失败
    category: 'Productivity',
    identity: '-',
    target: [
      {
        target: 'default',
        arch: ['arm64', 'x64']
      },
    ]
  },
  win: {
    icon: 'build/icons/icon.ico',
    target: [
      // disable build for x32 by default
      // 'nsis:ia32',
      'nsis:x64',
      // uncomment to generate web installer
      // electron-builder can use either web or offline installer to auto update
      // {
      //   target: 'nsis-web',
      //   arch: [
      //     'x64',
      //   ]
      // },
      {
        target: 'zip',
        arch: [
          'x64'
        ]
      }
    ]
  },
  linux: {
    icon: 'build/icons',
    target: [
      {
        target: 'deb'
      },
      {
        target: 'rpm'
      },
      {
        target: 'AppImage'
      },
      {
        target: 'snap'
      }
    ]
  },
  snap: {
    publish: [
      'github'
    ]
  }
}

module.exports = config
