import { watch, ref, toRaw, onMounted, onUnmounted } from 'vue'

import { notification } from "../../type";

const { fs, join, invoke, onMessage } = window.apis as any

const useUserData = (name = 'main', init = {}, extraEffect: any = null, gotData: any = () => { }) => {
    let userData = ref<any>(init)
    invoke('getUserPath')
        .then((userpath: string) => {
            const confPath = join(userpath, `${name}.json`)
            if (fs.existsSync(confPath)) {
                userData.value = JSON.parse(fs.readFileSync(confPath, { encoding: 'utf-8' }))
                // console.log('got userdata', name, toRaw(userData.value))
                gotData();
            } else {
                fs.writeFileSync(confPath, JSON.stringify(init))
                gotData();
            }
            // 其他进程(如 MCP 服务)改写数据后, 从磁盘重新载入
            onMessage(({ type, value }: any) => {
                if (type === 'userDataChanged' && value === name && fs.existsSync(confPath)) {
                    try {
                        userData.value = JSON.parse(fs.readFileSync(confPath, { encoding: 'utf-8' }))
                    } catch (e) {
                        console.error('reload user data failed', name, e)
                    }
                }
            })
            watch(userData, val => {
                // console.log('set userdata', name, toRaw(val))
                fs.writeFileSync(confPath, JSON.stringify(val))
                extraEffect?.(toRaw(val))
            }, { deep: true })
        })

    return userData
}

const useTimer = () => {
    let timers: any = ref([]);
    let timerHandler: NodeJS.Timeout | null = null;

    // 每秒重新拉取一次队列: 迟到创建的倒计时也能立即出现, 且已删除/已结束的会及时消失
    const tick = () => {
        invoke("getNotificationQ")
            .then((messageQ: notification[]) => {
                const now = Date.now();
                timers.value = messageQ
                    .map((item) => ({
                        id: item.id,
                        content: item.content,
                        last: Math.round((item.end - item.createTime) / 1000),
                        percent: (item.end - now) / (item.end - item.createTime),
                        remain: Math.round((item.end - now) / 1000),
                        fromMcp: item.fromMcp === true,
                    }))
                    .filter((i) => i.remain > 0);
            });
    };

    const stop = () => {
        if (timerHandler) clearInterval(timerHandler);
        timerHandler = null;
    };

    const fetchTimers = () => {
        stop();
        tick();
        timerHandler = setInterval(tick, 1000);
    };

    // 窗口被遮挡/隐藏时渲染进程的定时器会被节流, 重新可见时立即刷新一次, 避免进度停在旧值
    const refreshWhenVisible = () => {
        if (!document.hidden) tick();
    };

    onMounted(() => {
        fetchTimers();
        document.addEventListener("visibilitychange", refreshWhenVisible);
        window.addEventListener("focus", refreshWhenVisible);
    });
    onUnmounted(() => {
        stop();
        document.removeEventListener("visibilitychange", refreshWhenVisible);
        window.removeEventListener("focus", refreshWhenVisible);
    });
    return {
        timers,
        fetchTimers,
    }
}

const getBg = (idOrCustom: string) => {
    return idOrCustom.length === 1 ? `var(--sticky-${idOrCustom})` : idOrCustom
}

export {
    useUserData,
    useTimer,
    getBg,
}
