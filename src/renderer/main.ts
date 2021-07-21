import { createApp, h, defineComponent } from 'vue'
import { createRouter, createWebHashHistory, RouterView, RouteRecordRaw } from 'vue-router'
import Home from './home/Index.vue'
import Timer from './timer/Index.vue'
import Schedule from './schedule/Index.vue'
import Inspiration from './inspiration/Index.vue'
import Stickies from './stickies/Index.vue'

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
app.mount('#app')
