// 全局主题管理工具
export const applyTheme = (theme: string) => {
  const app = document.getElementById('app')
  if (!app) return

  // 移除所有主题类
  app.classList.remove('dark', 'light', 'system', 'theme-dark', 'theme-light', 'theme-system')
  
  // 应用新主题类
  if (theme === 'dark') {
    app.classList.add('dark', 'theme-dark')
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else if (theme === 'light') {
    app.classList.add('light', 'theme-light')
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  } else {
    // system theme - 根据系统偏好设置对应的主题类
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      app.classList.add('dark', 'theme-dark', 'system')
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      app.classList.add('light', 'theme-light', 'system')
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }
  
  // 设置 color-scheme
  document.documentElement.style.colorScheme = 
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
      ? 'dark' 
      : 'light'
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
