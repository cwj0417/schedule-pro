// 通用主题监听组合式函数
import { ref, onMounted, onUnmounted } from 'vue'

export function useThemeListener() {
  const currentTheme = ref('system')
  let messageListener: ((data: any) => void) | null = null

  const setupThemeListener = () => {
    if (!window.apis) return

    const { onMessage, invoke } = window.apis

    messageListener = ({ type, value }: any) => {
      if (type === 'themeChanged') {
        currentTheme.value = value
      }
    }

    onMessage(messageListener)

    // 获取初始主题
    invoke('getTheme').then((theme: string) => {
      if (theme) {
        currentTheme.value = theme
      }
    }).catch((error) => {
      console.error('获取主题设置失败:', error)
    })
  }

  onMounted(() => {
    setupThemeListener()
  })

  return {
    currentTheme
  }
}
