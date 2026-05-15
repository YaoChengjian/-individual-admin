<template>
  <div class="task-progress" :style="progressStyle">
    <div class="task-progress-track">
      <div class="task-progress-bar"></div>
    </div>
    <span>{{ safeValue }}%</span>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      percentage?: number;
      status?: string;
    }>(),
    {
      percentage: 0,
      status: ''
    }
  );

  const safeValue = computed(() => {
    const value = Number(props.percentage) || 0;
    return Math.min(100, Math.max(0, Math.round(value)));
  });

  const progressColor = computed(() => {
    if (props.status === 'overdue') return '#f04438';
    if (props.status === 'finished') return '#1f6feb';
    if (props.status === 'waiting') return '#7c3aed';
    return '#20b56b';
  });

  const progressStyle = computed(() => ({
    '--task-progress-value': `${safeValue.value}%`,
    '--task-progress-color': progressColor.value,
    '--task-progress-bg': `${progressColor.value}1a`
  }));
</script>

<style lang="scss" scoped>
  .task-progress {
    display: grid;
    grid-template-columns: minmax(76px, 1fr) 42px;
    gap: 10px;
    align-items: center;
    min-width: 132px;

    span {
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      line-height: 18px;
      text-align: right;
    }
  }

  .task-progress-track {
    position: relative;
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: #edf2f7;
    box-shadow: inset 0 1px 2px rgb(15 23 42 / 8%);

    &::after {
      position: absolute;
      inset: 0;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(255 255 255 / 55%),
        transparent
      );
      transform: translateX(-100%);
      animation: task-progress-shine 2.2s ease-in-out infinite;
    }
  }

  .task-progress-bar {
    position: relative;
    z-index: 1;
    width: var(--task-progress-value);
    height: 100%;
    border-radius: inherit;
    background:
      linear-gradient(90deg, rgb(255 255 255 / 20%), transparent),
      var(--task-progress-color);
    box-shadow: 0 0 0 3px var(--task-progress-bg);
    transition: width 0.25s ease;
  }

  @keyframes task-progress-shine {
    0% {
      transform: translateX(-100%);
    }

    50%,
    100% {
      transform: translateX(100%);
    }
  }
</style>
