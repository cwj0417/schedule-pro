import { watch, ref, toRaw } from 'vue'

const {fs, path, electron} = window.apis as any

const useUserData = (name = 'main', init = {}, extraEffect: any = null) => {
    let userData = ref<any>(init)
    electron.ipcRenderer.invoke('getUserPath')
    .then((userpath: string) => {
        const confPath = path.join(userpath, `${name}.json`)
        if (fs.existsSync(confPath)) {
            userData.value = JSON.parse(fs.readFileSync(confPath, { encoding: 'utf-8' }))
            console.log('got userdata', name, toRaw(userData.value))
        } else {
            fs.writeFileSync(confPath, JSON.stringify(init))
        }
        watch(userData.value, val => {
            console.log('set userdata', name, toRaw(val))
            fs.writeFileSync(confPath, JSON.stringify(val))
            extraEffect?.(toRaw(val))
        })
    })
    
    return userData
}

export {
    useUserData,
}
