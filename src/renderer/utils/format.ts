import { curry } from './helper'
const sortTodoStatus = (arr: any[]) =>
    arr ? [...arr.filter((i) => !i.done), ...arr.filter((i) => i.done)] : [];

const sort = (fields: string, order: 'asc' | 'desc', arr: any[]) =>
    arr ? arr.sort((a, b) => (a?.[fields] - b?.[fields]) * (order === 'asc' ? 1 : -1)) : []

const sortCreatetime = curry(sort, 'create_time', 'desc')

export {
    sortTodoStatus,
    sortCreatetime,
}
