// 全局主题管理工具
type ThemeBase = 'dark' | 'light'

// 深/浅基础主题与配色主题的映射
const THEMES: Record<string, { base: ThemeBase; className: string }> = {
  dark: { base: 'dark', className: 'theme-dark' },
  light: { base: 'light', className: 'theme-light' },
  tech: { base: 'dark', className: 'theme-tech' },
  forest: { base: 'light', className: 'theme-forest' },
  dopamine: { base: 'light', className: 'theme-dopamine' },
}

const THEME_CLASSES = [
  'theme-dark',
  'theme-light',
  'theme-system',
  'theme-tech',
  'theme-forest',
  'theme-dopamine',
]

// 主题对应的底色是深色还是浅色, 未指定或跟随系统时取系统偏好
export const resolveThemeBase = (theme: string): ThemeBase => {
  const preset = THEMES[theme]
  if (preset) return preset.base
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyTheme = (theme: string) => {
  const app = document.getElementById('app')
  if (!app) return

  const base = resolveThemeBase(theme)
  const isSystem = theme === 'system' || !THEMES[theme]
  const themeClass = THEMES[theme]?.className || `theme-${base}`

  // 移除所有主题类
  app.classList.remove('dark', 'light', 'system', ...THEME_CLASSES)

  // 应用新主题类
  app.classList.add(base, themeClass)
  if (isSystem) app.classList.add('system')

  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(base)
  document.documentElement.style.colorScheme = base
}

// 监听系统主题变化
export const setupSystemThemeListener = (currentTheme: string) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleSystemThemeChange = () => {
    if (currentTheme === 'system') {
      applyTheme('system')
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}
