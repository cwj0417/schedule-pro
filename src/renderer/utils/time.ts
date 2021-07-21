const getTs = (offset: number = 0) => {
    return new Date().setHours(offset * 24, 0, 0, 0);
}

export {
    getTs,
}
