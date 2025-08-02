import { createApp, h, defineComponent } from 'vue'
import { createRouter, createWebHashHistory, RouterView, RouteRecordRaw } from 'vue-router'
import Home from './home/Index.vue'
import Timer from './timer/Index.vue'
import Schedule from './schedule/Index.vue'
import Inspiration from './inspiration/Index.vue'
import Stickies from './stickies/Index.vue'
import Settings from './settings/Index.vue'
import { applyTheme, setupSystemThemeListener } from './utils/theme'
import './css/index.less'

const { invoke, onMessage } = window.apis

const App = defineComponent({
    render () {
        return h(RouterView)
    }
})

const routes: RouteRecordRaw[] = [
    { path: '/home', component: Home },
    { path: '/timer', component: Timer },
    { path: '/schedule', component: Schedule },
    { path: '/inspiration', component: Inspiration },
    { path: '/stickies', component: Stickies },
    { path: '/settings', component: Settings },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const app = createApp(App)
app.directive('focus', { // 因为场景比较单一, 先不考虑removeEventListener. 如果需要做, 可以先写个方法和变量, 方法是调用变量的. mounted设置变量, 以达到remove方法.
    mounted(el) {
        el.focus()
        window.addEventListener("focus", () => {
            el.focus()
        })
    }
})
app.use(router)

// 全局主题管理
let currentTheme = 'system'
let cleanupSystemListener: (() => void) | null = null

// 监听主题变化事件
onMessage(({ type, value }: any) => {
  if (type === 'themeChanged') {
    currentTheme = value
    applyTheme(value)
    
    // 清理旧的系统主题监听器
    if (cleanupSystemListener) {
      cleanupSystemListener()
    }
    
    // 设置新的系统主题监听器
    cleanupSystemListener = setupSystemThemeListener(value)
  }
})

// 初始化主题
const initializeTheme = async () => {
  try {
    const theme = await invoke('getTheme')
    if (theme) {
      currentTheme = theme
      applyTheme(theme)
      cleanupSystemListener = setupSystemThemeListener(theme)
    }
  } catch (error) {
    console.error('获取主题设置失败:', error)
    // 默认使用系统主题
    applyTheme('system')
    cleanupSystemListener = setupSystemThemeListener('system')
  }
}

// 初始化应用
initializeTheme().then(() => {
  app.mount('#app')
})
