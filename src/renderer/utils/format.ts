const sortTodoStatus = (arr: any[]) =>
    arr ? [...arr.filter((i) => !i.done), ...arr.filter((i) => i.done)] : [];

export {
    sortTodoStatus
}