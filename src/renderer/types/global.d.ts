// 全局类型定义
declare global {
  interface Window {
    apis: {
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      onMessage: (callback: (message: any) => void) => void
      copyText: (text: string) => void
      platform: string
    }
  }
}

export {}
