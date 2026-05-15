<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <div class="task-page-header">
      <div class="task-page-heading">
        <h1>任务管理</h1>
        <span>集中管理巡查任务、创建任务、下发任务与跟踪状态</span>
      </div>
      <div class="task-page-actions">
        <el-button
          ref="createTaskRef"
          size="large"
          type="primary"
          @click="handleAction('新建巡查任务')"
        >
          新建巡查任务
        </el-button>
        <el-button size="large" @click="handleAction('批量下发')"
          >批量下发</el-button
        >
        <el-button size="large" @click="handleAction('导出列表')"
          >导出列表</el-button
        >
      </div>
    </div>

    <task-search @search="handleSearch" />

    <task-table
      ref="taskTableRef"
      class="task-table-card"
      :task-type-dict="taskTypeDict"
      :task-status-dict="taskStatusDict"
      @dispatch-ref="(el) => (dispatchTaskTarget = el || null)"
    />

    <y-tour v-model="tourCurrent" :steps="tourSteps" />
  </y-page>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import type { ElButton } from 'element-plus';
  import { YMessage } from 'y-element-ultra';
  import type { TourStep } from 'y-element-ultra/es/y-tour/types';
  import { useDictData } from '@/utils/use-dict-data';
  import { getTaskTourStatus, hideTaskTourToday } from '@/api/task';
  import type { PatrolTaskParam } from '@/api/task/model';
  import TaskSearch from './components/task-search.vue';
  import TaskTable from './components/task-table.vue';

  defineOptions({ name: 'TaskManagement' });

  const taskTableRef = ref<InstanceType<typeof TaskTable> | null>(null);
  const router = useRouter();
  const createTaskRef = ref<InstanceType<typeof ElButton> | null>(null);
  const dispatchTaskTarget = ref<HTMLElement | null>(null);
  const tourCurrent = ref<number>();
  const currentWhere = ref<PatrolTaskParam>({});

  const [taskTypeDict, taskStatusDict] = useDictData([
    'patrol_task_type',
    'patrol_task_status'
  ]);

  const tourSteps = computed<TourStep[]>(() => [
    {
      target: () => createTaskRef.value?.$el as HTMLElement,
      title: '新建查询任务',
      description:
        '从这里创建新的巡查任务，设置任务类型、巡查地点、计划时间和执行人。',
      popoverProps: { placement: 'bottom-start' }
    },
    {
      target: () => dispatchTaskTarget.value as HTMLElement,
      title: '下发任务',
      description:
        '确认任务信息后，可在列表中将任务下发给指定巡查员并跟踪执行状态。',
      popoverProps: { placement: 'top' }
    }
  ]);

  const handleSearch = (where?: PatrolTaskParam) => {
    currentWhere.value = where || {};
    taskTableRef.value?.reload(where, 1);
  };

  const handleAction = (label: string) => {
    if (label === '新建巡查任务') {
      router.push('/task/management/create');
      return;
    }
    YMessage.info({ message: label, plain: true });
  };

  const tryStartTour = () => {
    getTaskTourStatus()
      .then((status) => {
        if (status.hidden) return;
        nextTick(() => {
          window.setTimeout(() => {
            tourCurrent.value = 0;
          }, 800);
        });
      })
      .catch(() => {});
  };

  onMounted(() => {
    tryStartTour();
  });

  watch(tourCurrent, (value, oldValue) => {
    if (oldValue != null && value == null) {
      hideTaskTourToday().catch(() => {});
    }
  });
</script>

<style lang="scss" scoped>
  .task-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .task-page-heading {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 14px;

    h1 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
      line-height: 34px;
    }

    span {
      color: #8b95a5;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  .task-page-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .task-table-card {
    min-width: 0;
    margin-top: 16px;
  }

  @media (max-width: 768px) {
    .task-page-header {
      align-items: stretch;
      flex-direction: column;
    }

    .task-page-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 2px;

      span {
        white-space: normal;
      }
    }

    .task-page-actions {
      justify-content: flex-start;
      flex-wrap: wrap;
    }
  }
</style>
