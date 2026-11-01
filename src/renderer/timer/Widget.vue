<template>
  <div class="timer-widget" :class="{ dragging }" @contextmenu.prevent="openMenu" @pointerdown="startDrag"
    @pointerup="endDrag" @pointercancel="endDrag">
    <div class="ball">
      <svg class="ring" viewBox="0 0 168 168">
        <defs>
          <linearGradient id="timerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: var(--theme-1)" />
            <stop offset="100%" style="stop-color: var(--theme-2)" />
          </linearGradient>
        </defs>
        <circle class="face" cx="84" cy="84" r="65" />
        <circle class="progress" cx="84" cy="84" r="67.5" transform="rotate(-90 84 84)"
          stroke="url(#timerRingGradient)" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
      </svg>
      <div class="content">
        <span class="time">{{ remainText }}</span>
        <span v-if="timer" class="label" :title="timer.content">{{ timer.content }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useTimer } from "../composition";

const { send } = window.apis;
const { timers } = useTimer();

// 多个倒计时同时存在时, 只展示最先结束的那个
const timer = computed(() => [...timers.value].sort((a, b) => a.remain - b.remain)[0]);

const radius = 67.5;
const circumference = 2 * Math.PI * radius;

const dashOffset = computed(() => {
  const percent = Math.max(0, Math.min(1, timer.value?.percent ?? 0));
  return circumference * (1 - percent);
});

const remainText = computed(() => {
  const seconds = Math.max(0, timer.value?.remain ?? 0);
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
});

const openMenu = () => send("showTimerWidgetMenu");

// 左键拖动窗口: 只通知主进程开始/结束, 实际的窗口移动在主进程按光标位置同步
const dragging = ref(false);

const startDrag = (e: PointerEvent) => {
  if (e.button !== 0) return;
  dragging.value = true;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  send("timerWidgetDragStart");
};

const endDrag = () => {
  if (!dragging.value) return;
  dragging.value = false;
  send("timerWidgetDragEnd");
};
</script>

<style lang="less" scoped>
.timer-widget {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  user-select: none;
  cursor: grab;

  &.dragging {
    cursor: grabbing;
  }
}

// 不用 position: relative; 圆面用 SVG 填充而不是 CSS 背景, 避免独立栅格化的白色圆盘
// 在描边外侧留下抗锯齿白边
.ball {
  display: grid;
  place-items: center;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  box-shadow: 0 8px 24px var(--shadow-0);
  transition: box-shadow 0.18s ease;
}

.timer-widget:hover .ball {
  box-shadow: 0 10px 28px var(--shadow-0), 0 0 18px var(--theme-5);
}

// 画布铺满整个窗口(用负外边距让它仍居中于 140 的球体), 使图层边缘与窗口边缘重合,
// 避免 SVG 图层接缝在球体周围露出一圈方形描边
.ring {
  grid-area: 1 / 1;
  width: 168px;
  height: 168px;
  margin: -14px;
  overflow: visible;
  pointer-events: none;
}

.face {
  fill: var(--bg-1);
}

.content {
  grid-area: 1 / 1;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

// 剩余比例逐秒收缩, transition 让圆弧平滑过渡而不是跳变; hover 时加粗并带主题色光晕
.progress {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear, stroke-width 0.18s ease, filter 0.18s ease;
}

.timer-widget:hover .progress {
  stroke-width: 6;
  filter: drop-shadow(0 0 5px var(--theme-0));
}

.time {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-0);
}

.label {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  line-height: 1.3;
  color: var(--color-2);
}
</style>
