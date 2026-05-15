<!-- 任务执行动态 -->
<template>
  <y-card
    :header="title"
    :body-style="{ padding: '6px 0' }"
    class="task-activity-card"
  >
    <template #extra>
      <el-link
        type="info"
        underline="never"
        class="activity-more-link"
        @click="handleViewMore"
      >
        查看更多
        <el-icon><ArrowRight /></el-icon>
      </el-link>
    </template>
    <el-scrollbar :view-style="{ padding: '18px 20px 0' }">
      <el-timeline :reverse="false" class="task-timeline">
        <el-timeline-item
          v-for="item in activities"
          :key="item.id"
          :timestamp="item.time"
          :type="item.type"
          :class="item.progressClass"
        >
          <div class="task-activity-item">
            <div class="task-activity-content">
              <div class="task-activity-title">{{ item.title }}</div>
              <div class="task-activity-desc">{{ item.desc }}</div>
            </div>
            <div class="task-activity-time">{{ item.time }}</div>
            <div class="task-activity-status" :class="item.progressClass">
              <span v-if="item.status === '已完成'">{{ item.status }}</span>
              <y-dot
                v-else
                :text="item.status"
                :type="item.statusType"
                :color="item.statusColor"
                size="7px"
                ripple
              />
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>
  </y-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { ArrowRight } from '@element-plus/icons-vue';
  import { YMessage } from 'y-element-ultra';

  withDefaults(
    defineProps<{
      title?: string;
      taskMode?: boolean;
    }>(),
    {
      title: '任务执行动态',
      taskMode: true
    }
  );

  interface Activity {
    id: number;
    title: string;
    time: string;
    desc: string;
    status: string;
    statusType?: 'success' | 'warning' | 'danger' | 'info';
    statusColor?: string;
    progressClass: string;
    type?: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }

  const activities = ref<Activity[]>([
    {
      id: 1,
      title: '任务创建',
      desc: '管理员创建巡查任务',
      time: '05-20 08:30:15',
      status: '已完成',
      progressClass: 'is-finished',
      type: 'primary'
    },
    {
      id: 2,
      title: '任务下发',
      desc: '任务下发至巡查终端',
      time: '05-20 08:31:02',
      status: '待派单',
      statusType: 'warning',
      progressClass: 'is-wait-dispatch',
      type: 'primary'
    },
    {
      id: 3,
      title: '到点巡查',
      desc: '巡查员到达指定点位',
      time: '05-20 08:45:18',
      status: '处理中',
      statusColor: 'var(--el-color-primary)',
      progressClass: 'is-processing',
      type: 'primary'
    },
    {
      id: 4,
      title: 'AI识别',
      desc: 'AI识别发现异常事件',
      time: '05-20 08:45:42',
      status: '待处理',
      statusType: 'danger',
      progressClass: 'is-pending',
      type: 'primary'
    },
    {
      id: 5,
      title: '工单上报',
      desc: '事件工单上报系统',
      time: '05-20 08:46:10',
      status: '处理中',
      statusColor: 'var(--el-color-primary)',
      progressClass: 'is-processing',
      type: 'primary'
    },
    {
      id: 6,
      title: '整改通知书打印',
      desc: '打印整改通知书并送达',
      time: '05-20 08:55:33',
      status: '待处理',
      statusType: 'danger',
      progressClass: 'is-pending',
      type: 'primary'
    },
    {
      id: 7,
      title: '任务归档',
      desc: '任务完成归档',
      time: '05-20 09:10:05',
      status: '待处理',
      statusType: 'info',
      progressClass: 'is-waiting'
    }
  ]);

  const handleViewMore = () => {
    YMessage.info({ message: '查看更多任务执行动态', plain: true });
  };
</script>

<style lang="scss" scoped>
  .activity-more-link {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
    font-weight: 500;

    :deep(.el-icon) {
      margin-left: 4px;
      font-size: 14px;
    }
  }

  .task-activity-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
    }

    .el-scrollbar {
      flex: 1;
      min-height: 0;
    }

    :deep(.y-card-header) {
      font-weight: 700;
    }
  }

  .task-timeline {
    padding-left: 0;

    :deep(.el-timeline-item) {
      padding-bottom: 14px;
    }

    :deep(.el-timeline-item__tail) {
      top: 15px;
      left: 5px;
      border-left: 2px solid #d8dee9;
    }

    :deep(.el-timeline-item__node) {
      top: 0;
      left: -1px;
      width: 14px;
      height: 14px;
      background: #d8dee9;
      border: 0;
      box-shadow: 0 0 0 3px #f2f5f9;
    }

    :deep(.el-timeline-item__dot) {
      left: -1px;
    }

    :deep(.el-timeline-item__wrapper) {
      min-height: 40px;
      padding-left: 30px;
    }

    :deep(.el-timeline-item__timestamp) {
      display: none;
    }

    :deep(.el-timeline-item.is-finished) {
      .el-timeline-item__tail {
        border-left-color: var(--el-color-success);
      }

      .el-timeline-item__node {
        background: var(--el-color-success);
        box-shadow: 0 0 0 3px var(--el-color-success-light-9);
      }
    }

    :deep(.el-timeline-item.is-processing) {
      .el-timeline-item__tail {
        border-left-color: var(--el-color-primary);
      }

      .el-timeline-item__node {
        background: var(--el-color-primary);
        box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
      }
    }

    :deep(.el-timeline-item.is-wait-dispatch) {
      .el-timeline-item__tail {
        border-left-color: var(--el-color-warning);
      }

      .el-timeline-item__node {
        background: var(--el-color-warning);
        box-shadow: 0 0 0 3px var(--el-color-warning-light-9);
      }
    }

    :deep(.el-timeline-item.is-pending) {
      .el-timeline-item__tail {
        border-left-color: var(--el-color-danger);
      }

      .el-timeline-item__node {
        background: var(--el-color-danger);
        box-shadow: 0 0 0 3px var(--el-color-danger-light-9);
      }
    }

    :deep(.el-timeline-item.is-waiting) {
      .el-timeline-item__tail {
        border-left-color: #d8dee9;
      }

      .el-timeline-item__node {
        background: #d8dee9;
        box-shadow: 0 0 0 3px #f2f5f9;
      }
    }
  }

  .task-activity-item {
    display: grid;
    align-items: center;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 10px;
  }

  .task-activity-title {
    color: #1f2937;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  .task-activity-desc {
    color: #8a94a6;
    font-size: 13px;
    line-height: 18px;
  }

  .task-activity-time {
    color: #8a94a6;
    font-size: 13px;
    white-space: nowrap;
  }

  .task-activity-status {
    color: var(--el-color-success);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;

    &.is-processing {
      color: var(--el-color-primary);
    }

    &.is-wait-dispatch {
      color: var(--el-color-warning);
    }

    &.is-pending {
      color: var(--el-color-danger);
    }

    &.is-waiting {
      color: var(--el-text-color-placeholder);
    }

    :deep(.y-dot-text) {
      color: inherit;
      margin-left: 6px;
      font-weight: 700;
    }
  }
</style>
