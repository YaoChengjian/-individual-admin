<template>
  <y-card
    header="任务完成情况"
    :body-style="{ height: '310px', padding: '14px 16px' }"
    class="task-finish-card"
  >
    <div class="task-finish-body">
      <div class="task-trend">
        <div class="task-legend">
          <span
            v-for="item in legendItems"
            :key="item.name"
            class="task-legend-item"
          >
            <i :style="{ backgroundColor: item.color }"></i>
            {{ item.name }}
          </span>
        </div>
        <v-chart
          ref="barChartRef"
          :option="barOption"
          autoresize
          class="task-bar-chart"
        />
      </div>
      <div class="task-summary">
        <div class="task-summary-title">今日汇总（截至当前）</div>
        <div class="task-summary-content">
          <v-chart
            ref="pieChartRef"
            :option="pieOption"
            autoresize
            class="task-pie-chart"
          />
          <div class="task-summary-list">
            <div
              v-for="item in summaryItems"
              :key="item.name"
              class="task-summary-item"
            >
              <span class="summary-dot" :style="{ background: item.color }"></span>
              <div>
                <div class="summary-name">{{ item.name }}</div>
                <div class="summary-value">{{ item.value }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { use } from 'echarts/core';
  import type { EChartsCoreOption } from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  import { BarChart, PieChart } from 'echarts/charts';
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent
  } from 'echarts/components';
  import VChart from 'vue-echarts';
  import { useEcharts } from '@/utils/use-echarts';

  use([
    CanvasRenderer,
    BarChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    LegendComponent
  ]);

  const barChartRef = ref<InstanceType<typeof VChart> | null>(null);
  const pieChartRef = ref<InstanceType<typeof VChart> | null>(null);
  useEcharts([barChartRef, pieChartRef]);

  const colors = {
    finish: '#1f6feb',
    timeout: '#22a957',
    event: '#ff8a00'
  };

  const legendItems = [
    { name: '完成率', color: colors.finish },
    { name: '超时率', color: colors.timeout },
    { name: '事件发现率', color: colors.event }
  ];

  const trendData = [
    { date: '05-14', finish: 89, timeout: 7, event: 18 },
    { date: '05-15', finish: 76, timeout: 8, event: 19 },
    { date: '05-16', finish: 87, timeout: 6, event: 18 },
    { date: '05-17', finish: 78, timeout: 10, event: 23 },
    { date: '05-18', finish: 85, timeout: 8, event: 18 },
    { date: '05-19', finish: 86, timeout: 9, event: 17 },
    { date: '05-20', finish: 72, timeout: 7, event: 20 }
  ];

  const summaryItems = [
    { name: '完成率', value: 71.9, color: colors.finish },
    { name: '超时率', value: 8.6, color: colors.timeout },
    { name: '事件发现率', value: 32.4, color: colors.event }
  ];

  const barOption = computed<EChartsCoreOption>(() => ({
    color: [colors.finish, colors.timeout, colors.event],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      top: 26,
      right: 8,
      bottom: 22,
      left: 32
    },
    xAxis: {
      type: 'category',
      data: trendData.map((item) => item.date),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#d9e0ec' } },
      axisLabel: { color: '#667085', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: {
        color: '#667085',
        fontSize: 11,
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: '#eef2f7' } }
    },
    series: [
      {
        name: '完成率',
        type: 'bar',
        barWidth: 8,
        barGap: '55%',
        data: trendData.map((item) => item.finish),
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '超时率',
        type: 'bar',
        barWidth: 8,
        data: trendData.map((item) => item.timeout),
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '事件发现率',
        type: 'bar',
        barWidth: 8,
        data: trendData.map((item) => item.event),
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ]
  }));

  const pieOption = computed<EChartsCoreOption>(() => ({
    color: [colors.finish, colors.timeout, colors.event],
    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => `${value}%`
    },
    series: [
      {
        type: 'pie',
        radius: ['56%', '78%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: summaryItems.map((item) => ({
          name: item.name,
          value: item.value
        }))
      }
    ]
  }));
</script>

<style lang="scss" scoped>
  .task-finish-body {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(190px, 0.75fr);
    height: 100%;
    gap: 14px;
  }

  .task-trend,
  .task-summary {
    min-width: 0;
  }

  .task-legend {
    display: flex;
    align-items: center;
    gap: 18px;
    height: 24px;
    color: #667085;
    font-size: 12px;
    font-weight: 600;
  }

  .task-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;

    i {
      width: 9px;
      height: 9px;
      border-radius: 3px;
    }
  }

  .task-bar-chart {
    height: calc(100% - 24px);
  }

  .task-summary-title {
    height: 24px;
    color: #8a94a6;
    font-size: 13px;
    font-weight: 700;
    line-height: 24px;
    text-align: center;
  }

  .task-summary-content {
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    align-items: center;
    height: calc(100% - 24px);
    gap: 8px;
  }

  .task-pie-chart {
    width: 108px;
    height: 108px;
  }

  .task-summary-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .task-summary-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .summary-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 5px;
    border-radius: 50%;
  }

  .summary-name {
    color: #667085;
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;
  }

  .summary-value {
    color: #101828;
    font-size: 22px;
    font-weight: 800;
    line-height: 28px;
  }

  @media (max-width: 768px) {
    .task-finish-body {
      grid-template-columns: 1fr;
    }

    .task-summary {
      display: none;
    }
  }
</style>
