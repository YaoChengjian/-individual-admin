<!-- 统计卡片 -->
<template>
  <div class="monitor-stat-wrap">
    <div class="monitor-stat-actions">
      <div class="monitor-stat-heading">
        <div class="monitor-stat-title">指挥中心预览</div>
        <div class="monitor-stat-subtitle">
          智能巡查任务运行总览与闭环处置态势
        </div>
      </div>
      <div class="monitor-stat-buttons">
        <el-button
          type="primary"
          size="large"
          :icon="DocumentAdd"
          @click="handleAction('新建任务')"
        >
          新建任务
        </el-button>
        <el-button
          size="large"
          :icon="Operation"
          @click="handleAction('进入调度')"
        >
          进入调度
        </el-button>
        <el-button
          size="large"
          :icon="DataAnalysis"
          @click="handleAction('查看报告')"
        >
          查看报告
        </el-button>
      </div>
    </div>
    <div class="monitor-stat-grid">
      <y-card
        v-for="item in statistics"
        :key="item.title"
        class="monitor-count"
      >
        <div class="monitor-count-main-row">
          <div
            class="monitor-count-icon"
            :style="{ color: item.color, backgroundColor: item.bgColor }"
          >
            <el-icon :size="28">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="monitor-count-body">
            <div class="monitor-count-title">{{ item.title }}</div>
            <div class="monitor-count-main">
              <span class="monitor-count-value">{{ item.value }}</span>
              <el-icon v-if="item.valueArrow" class="monitor-count-arrow">
                <Top />
              </el-icon>
              <span v-if="item.unit" class="monitor-count-unit">
                {{ item.unit }}
              </span>
            </div>
            <div class="monitor-count-compare">
              <span>较昨日</span>
              <span
                class="monitor-count-trend"
                :class="{ 'is-danger': item.danger }"
              >
                <el-icon :size="11"><CaretTop /></el-icon>
                {{ item.trend }}
              </span>
            </div>
          </div>
        </div>
      </y-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import {
    DataAnalysis,
    DocumentChecked,
    DocumentAdd,
    VideoPlay,
    CircleCheckFilled,
    WarningFilled,
    Document,
    Operation,
    Printer,
    CaretTop,
    Top
  } from '@element-plus/icons-vue';
  import { YMessage } from 'y-element-ultra';
  import { getClosedLoopSummary } from '@/api/closed-loop';
  import type { DashboardSummary } from '@/api/closed-loop/model';

  const summary = ref<DashboardSummary>({
    todayTaskCount: 128,
    runningTaskCount: 36,
    completedTaskCount: 92,
    pendingWorkOrderCount: 27,
    timeoutWorkOrderCount: 1,
    aiDetectCount: 36,
    highRiskCount: 18,
    closureRate: 92.5,
    avgHandleTime: '2分30秒'
  });

  const statistics = computed(() => [
    {
      title: '今日任务数',
      value: String(summary.value.todayTaskCount),
      trend: '12.5%',
      color: '#2563eb',
      bgColor: '#eef4ff',
      valueArrow: true,
      icon: DocumentChecked
    },
    {
      title: '执行中任务',
      value: String(summary.value.runningTaskCount),
      trend: '5.3%',
      color: '#22a957',
      bgColor: '#eaf8ef',
      valueArrow: true,
      icon: VideoPlay
    },
    {
      title: '已完成任务',
      value: String(summary.value.completedTaskCount),
      trend: '18.7%',
      color: '#1f6feb',
      bgColor: '#eef4ff',
      valueArrow: true,
      icon: CircleCheckFilled
    },
    {
      title: '异常事件数',
      value: String(summary.value.highRiskCount),
      unit: '件',
      trend: '28.6%',
      color: '#f04438',
      bgColor: '#fff0ed',
      danger: true,
      icon: WarningFilled
    },
    {
      title: '待处理工单',
      value: String(summary.value.pendingWorkOrderCount),
      unit: '件',
      trend: '12.0%',
      color: '#f59e0b',
      bgColor: '#fff4e5',
      danger: true,
      icon: Document
    },
    {
      title: '今日打印文书数',
      value: '46',
      unit: '份',
      trend: '15.0%',
      color: '#1f6feb',
      bgColor: '#eef4ff',
      icon: Printer
    }
  ]);

  onMounted(() => {
    getClosedLoopSummary()
      .then((data) => {
        summary.value = data;
      })
      .catch(() => {});
  });

  const handleAction = (label: string) => {
    YMessage.info({ message: label, plain: true });
  };
</script>

<style lang="scss" scoped>
  .monitor-stat-wrap {
    margin-bottom: 16px;
  }

  .monitor-stat-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .monitor-stat-heading {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 12px;
  }

  .monitor-stat-title {
    min-width: 0;
    color: #1f2937;
    font-size: 26px;
    font-weight: 700;
    line-height: 36px;
  }

  .monitor-stat-subtitle {
    color: #d9d9d9;
    font-size: 13px;
    line-height: 20px;
    white-space: nowrap;
  }

  .monitor-stat-buttons {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .monitor-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 12px;
    align-items: stretch;
  }

  .monitor-count {
    height: 100%;
    min-height: 96px;
    padding: 16px 16px 12px;
    border: 1px solid #e8edf5;
    border-radius: 8px;
    box-shadow: 0 1px 6px rgba(17, 24, 39, 0.08);

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      min-height: 68px;
      padding: 0;
    }

    .monitor-count-main-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 14px;
      width: 100%;
    }

    .monitor-count-icon {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      border-radius: 50%;
    }

    .monitor-count-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      flex: 1 1 auto;
      text-align: left;
    }

    .monitor-count-title {
      color: #4b5563;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .monitor-count-main {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      color: #111827;
      line-height: 34px;
    }

    .monitor-count-value {
      font-size: 34px;
      font-weight: 700;
      letter-spacing: 0;
    }

    .monitor-count-arrow {
      margin-left: 2px;
      color: #9aa4b2;
      font-size: 16px;
    }

    .monitor-count-unit {
      color: #4b5563;
      font-size: 14px;
      font-weight: 500;
    }

    .monitor-count-compare {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 7px;
      margin-top: 4px;
      color: #6b7280;
      font-size: 13px;
      line-height: 18px;
      white-space: nowrap;
    }

    .monitor-count-trend {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      color: #20b56b;
      font-weight: 700;

      &.is-danger {
        color: #ff3b30;
      }
    }

    .monitor-count-tip {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 15px;
      cursor: help;
    }
  }

  @media (max-width: 1399px) {
    .monitor-count {
      .monitor-count-icon {
        width: 48px;
        height: 48px;
      }

      .monitor-count-value {
        font-size: 30px;
      }
    }
  }

  @media (max-width: 1199px) {
    .monitor-stat-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    }
  }

  @media (max-width: 768px) {
    .monitor-stat-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .monitor-stat-heading {
      align-items: flex-start;
      flex-direction: column;
      gap: 0;
    }

    .monitor-stat-title {
      font-size: 22px;
      line-height: 30px;
    }

    .monitor-stat-subtitle {
      white-space: normal;
    }

    .monitor-stat-buttons {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .monitor-stat-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
    }
  }
</style>
