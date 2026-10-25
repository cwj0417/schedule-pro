const getTs = (offset: number = 0) => {
    return new Date().setHours(offset * 24, 0, 0, 0);
}

const formatCountdown = (second: number) => {
    return `${second >= 60 ? Math.floor(second / 60) + ' min ' : ''} ${second % 60 !== 0 ? second % 60 + ' sec' : ''}`
}

// 把时间戳转成 "upto now" 的中文相对描述: 刚刚 / 今天 / 昨天 / N 天前 / N 个月前 / N 年前
const formatRelativeTime = (timestamp?: number | null) => {
    if (!timestamp) return ''
    const now = new Date()
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / (24 * 60 * 60 * 1000))

    if (now.getTime() - date.getTime() < 60 * 1000) return '刚刚'
    if (dayDiff <= 0) return '今天'
    if (dayDiff === 1) return '昨天'
    if (dayDiff < 30) return `${dayDiff} 天前`

    const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
    if (monthDiff < 12) return `${Math.max(1, monthDiff)} 个月前`
    return `${Math.max(1, now.getFullYear() - date.getFullYear())} 年前`
}

export {
    getTs,
    formatCountdown,
    formatRelativeTime,
}
