<template>
  <y-page hide-footer :multi-card="false">
    <div class="detail-page">
      <el-skeleton v-if="loading" animated :rows="8" />
      <div v-else class="detail-layout">
        <basic-info
          class="detail-card-basic"
          :model-value="form"
          :priorities="priorityDict"
          readonly
        />
        <range-points
          class="detail-card-range"
          :model-value="form"
          :areas="context.areas"
          :points="context.points"
          readonly
        />
        <time-setting class="detail-card-time" :model-value="form" readonly />
        <executor-device
          class="detail-card-executor"
          :model-value="form"
          :executors="context.executors"
          readonly
        />
      </div>
    </div>

    <div class="detail-footer" :class="{ 'is-visible': footerVisible }">
      <el-button size="large" @click="back">返回列表</el-button>
    </div>
  </y-page>
</template>

<script lang="ts" setup>
  import { onDeactivated, reactive, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
  import { YMessage } from 'y-element-ultra';
  import { getPatrolTaskDetail } from '@/api/task';
  import { useDictData } from '@/utils/use-dict-data';
  import type {
    PatrolTaskCreateState,
    TaskCreateContext
  } from '../create/types';
  import BasicInfo from '../create/components/basic-info.vue';
  import ExecutorDevice from '../create/components/executor-device.vue';
  import RangePoints from '../create/components/range-points.vue';
  import TimeSetting from '../create/components/time-setting.vue';

  defineOptions({ name: 'TaskManagementDetail' });

  const route = useRoute();
  const router = useRouter();
  const [priorityDict] = useDictData(['patrol_task_priority']);

  const loading = ref(true);
  const footerVisible = ref(false);
  let footerTimer = 0;
  const context = reactive<TaskCreateContext>({
    areas: [],
    points: [],
    executors: []
  });

  const form = reactive<PatrolTaskCreateState>({
    taskTitle: '',
    taskType: '',
    priority: '',
    description: '',
    aiFocus: false,
    areaIds: [],
    pointIds: [],
    startTime: '',
    endTime: '',
    durationHours: '',
    repeatRule: '',
    executorId: undefined
  });

  const getEmptyForm = (): PatrolTaskCreateState => ({
    taskTitle: '',
    taskType: '',
    priority: '',
    description: '',
    aiFocus: false,
    areaIds: [],
    pointIds: [],
    startTime: '',
    endTime: '',
    durationHours: '',
    repeatRule: '',
    executorId: undefined
  });

  const resetForm = () => {
    Object.assign(form, getEmptyForm());
    context.areas = [];
    context.points = [];
    context.executors = [];
  };

  const fillTask = (task: any) => {
    form.taskTitle = task.taskTitle || task.title || '';
    form.taskType = task.taskType || task.type || '';
    form.priority = task.priority || '';
    form.description = task.description || '暂无任务说明';
    form.aiFocus = !!task.aiFocus;
    form.areaIds = task.areaIds || [];
    form.pointIds = task.pointIds || [];
    form.startTime = task.startTime || task.planTime || '';
    form.endTime = task.endTime || '';
    form.durationHours = task.durationHours || '';
    form.repeatRule = task.repeatRule || '';
    form.executorId = task.executorId;
  };

  const hideFooter = () => {
    if (footerTimer) {
      window.cancelAnimationFrame(footerTimer);
      footerTimer = 0;
    }
    footerVisible.value = false;
  };

  const showFooter = () => {
    hideFooter();
    footerTimer = window.requestAnimationFrame(() => {
      footerTimer = 0;
      footerVisible.value = route.path === '/task/management/detail' && !loading.value;
    });
  };

  const loadDetail = () => {
    if (route.path !== '/task/management/detail') {
      hideFooter();
      return;
    }
    hideFooter();
    const taskId = Number(route.query.taskId);
    const taskCode = String(route.query.taskCode || '');
    if (!taskId && !taskCode) {
      YMessage.warning({ message: '缺少巡查任务参数', plain: true });
      router.push('/task/management');
      return;
    }

    loading.value = true;
    resetForm();
    getPatrolTaskDetail({
      taskId: taskId || undefined,
      taskCode: taskCode || undefined
    })
      .then((data) => {
        context.areas = data.areas || [];
        context.points = data.points || [];
        context.executors = data.executors || [];
        fillTask(data.task || {});
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
        router.push('/task/management');
      })
      .finally(() => {
        loading.value = false;
        showFooter();
      });
  };

  const back = () => {
    router.push('/task/management');
  };

  watch(
    () => [route.path, route.query.taskId, route.query.taskCode],
    () => {
      if (route.path === '/task/management/detail') {
        loadDetail();
      } else {
        hideFooter();
      }
    },
    { immediate: true }
  );

  onBeforeRouteLeave(() => {
    hideFooter();
  });

  onDeactivated(() => {
    hideFooter();
  });
</script>

<style lang="scss" scoped>
  .detail-page {
    padding-bottom: 86px;
  }

  .detail-layout {
    display: grid;
    grid-template-columns: minmax(360px, 0.88fr) minmax(620px, 1.42fr);
    grid-template-areas:
      'basic range'
      'time executor';
    gap: 18px;
    align-items: stretch;
  }

  .detail-card-basic {
    grid-area: basic;
  }

  .detail-card-range {
    grid-area: range;
  }

  .detail-card-time {
    grid-area: time;
  }

  .detail-card-executor {
    grid-area: executor;
  }

  :deep(.create-card) {
    height: 100%;
    border-radius: 8px;
  }

  .detail-footer {
    position: fixed;
    z-index: 9;
    right: 0;
    bottom: 0;
    left: var(--y-admin-sidebar-width, 220px);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding: 12px 20px;
    border-top: 1px solid #edf1f7;
    background: rgb(255 255 255 / 94%);
    backdrop-filter: blur(10px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.16s ease;

    &.is-visible {
      opacity: 1;
      pointer-events: auto;
    }

    .el-button {
      min-width: 128px;
    }
  }

  @media (max-width: 1500px) {
    .detail-layout {
      grid-template-columns: minmax(340px, 0.9fr) minmax(520px, 1.2fr);
    }
  }

  @media (max-width: 1280px) {
    .detail-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        'basic'
        'range'
        'time'
        'executor';
    }
  }

  @media (max-width: 768px) {
    .detail-footer {
      left: 0;
      padding-right: 12px;
      padding-left: 12px;
    }
  }
</style>
