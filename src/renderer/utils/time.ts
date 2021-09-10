const getTs = (offset: number = 0) => {
    return new Date().setHours(offset * 24, 0, 0, 0);
}

const formatCountdown = (second: number) => {
    return `${second >= 60 ? Math.floor(second / 60) + ' min ' : ''} ${second % 60 !== 0 ? second % 60 + 'sec' : ''}`
}

export {
    getTs,
    formatCountdown,
}
