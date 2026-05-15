<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <div class="report-header">
      <div class="page-heading">
        <h1>报告中心</h1>
        <span>沉淀巡查任务、AI 识别、工单处置、文书归档的闭环成果</span>
      </div>
      <div class="page-actions">
        <el-button size="large" type="primary" @click="reload()">刷新报告</el-button>
        <el-button size="large" @click="showPreview = true">查看归档包</el-button>
      </div>
    </div>

    <div class="report-summary-grid">
      <y-card v-for="item in summaryCards" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.desc }}</small>
      </y-card>
    </div>

    <y-card class="report-table-card" :body-style="{ paddingTop: '8px' }" flex-table="auto">
      <template #header>
        <div class="table-title">闭环报告列表</div>
      </template>
      <template #extra>
        <el-input
          v-model="query.keywords"
          clearable
          placeholder="搜索报告编号 / 标题"
          style="width: 260px"
          @keyup.enter="reload()"
        />
      </template>
      <y-pro-table
        ref="tableRef"
        row-key="reportId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        cache-key="ReportCenterTable"
      >
        <template #reportStatus="{ row }">
          <y-dot
            :text="row.reportStatusName"
            :color="row.statusColor"
            :ripple="row.statusRipple"
            size="7px"
            class="status-dot"
          />
        </template>
        <template #closureRate="{ row }">
          <div class="closure-cell">
            <el-progress
              :percentage="row.closureRate"
              :stroke-width="8"
              :show-text="false"
            />
            <span>{{ row.closureRate }}%</span>
          </div>
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[
              { title: '查看报告', onClick: () => openPreview(row) },
              { title: '导出PDF', onClick: () => toast('导出PDF') },
              { title: '归档', props: { disabled: row.reportStatus === 'archived' }, onClick: () => archive(row) }
            ]"
          />
        </template>
      </y-pro-table>
    </y-card>

    <y-modal v-model="showPreview" title="闭环报告预览" width="760px">
      <div v-if="current" class="report-preview">
        <div class="preview-cover">
          <div>
            <span>{{ current.reportCode }}</span>
            <h2>{{ current.reportTitle }}</h2>
          </div>
          <y-dot
            :text="current.reportStatusName"
            :color="current.statusColor"
            :ripple="current.statusRipple"
            size="8px"
          />
        </div>
        <div class="preview-metrics">
          <div><span>闭环率</span><strong>{{ current.closureRate }}%</strong></div>
          <div><span>巡查点位</span><strong>{{ current.pointCount }}</strong></div>
          <div><span>AI识别</span><strong>{{ current.aiDetectCount }}</strong></div>
          <div><span>工单数</span><strong>{{ current.workOrderCount }}</strong></div>
        </div>
        <el-divider />
        <p>{{ current.summary }}</p>
        <div class="report-section-grid">
          <div>任务基本信息</div>
          <div>巡查点位统计</div>
          <div>AI识别统计</div>
          <div>工单流转统计</div>
          <div>处置效率统计</div>
          <div>文书记录</div>
        </div>
      </div>
      <el-empty v-else description="请选择报告" />
    </y-modal>
  </y-page>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { YMessage } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import {
    archiveInspectionReport,
    pageInspectionReports
  } from '@/api/closed-loop';
  import type {
    ClosedLoopParam,
    InspectionReport
  } from '@/api/closed-loop/model';

  defineOptions({ name: 'ReportCenter' });

  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const query = ref<ClosedLoopParam>({});
  const current = ref<InspectionReport>();
  const showPreview = ref(false);

  const summaryCards = computed(() => [
    { label: '今日生成报告', value: '8', desc: '较昨日 +15.0%' },
    { label: '已归档报告', value: '23', desc: '闭环档案持续沉淀' },
    { label: '平均闭环率', value: '92.5%', desc: '处置质量稳定提升' },
    { label: '超时报告', value: '1', desc: '自动进入催办队列' }
  ]);

  const columns = ref<Columns>([
    { prop: 'reportCode', label: '报告编号', minWidth: 150, fixed: 'left' },
    { prop: 'reportTitle', label: '报告标题', minWidth: 260 },
    { prop: 'reportStatus', label: '报告状态', width: 120, align: 'center', slot: 'reportStatus' },
    { prop: 'closureRate', label: '闭环率', minWidth: 160, slot: 'closureRate' },
    { prop: 'pointCount', label: '点位数', width: 90, align: 'center' },
    { prop: 'aiDetectCount', label: 'AI识别', width: 100, align: 'center' },
    { prop: 'workOrderCount', label: '工单数', width: 90, align: 'center' },
    { prop: 'generatedTime', label: '生成时间', width: 160, align: 'center' },
    { columnKey: 'action', label: '操作', width: 200, fixed: 'right', align: 'center', slot: 'action', showOverflowTooltip: false }
  ]);

  const datasource: DatasourceFunction = ({ pages, orders }) => {
    return pageInspectionReports({ ...query.value, ...pages, ...orders });
  };

  const reload = () => {
    tableRef.value?.reload?.({ where: query.value, page: 1 });
  };

  const openPreview = (row: InspectionReport) => {
    current.value = row;
    showPreview.value = true;
  };

  const archive = (row: InspectionReport) => {
    archiveInspectionReport(row.reportId)
      .then((data) => {
        YMessage.success({ message: '归档成功', plain: true });
        current.value = data;
        reload();
      })
      .catch((e) => YMessage.error({ message: e.message, plain: true }));
  };

  const toast = (message: string) => {
    YMessage.info({ message, plain: true });
  };
</script>

<style lang="scss" scoped>
  .report-header,
  .page-heading,
  .page-actions {
    display: flex;
    align-items: center;
  }

  .report-header {
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .page-heading {
    align-items: baseline;
    gap: 14px;

    h1 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
    }

    span {
      color: #8b95a5;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  .page-actions {
    gap: 10px;
  }

  .report-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .summary-card {
    border-radius: 8px;

    span,
    strong,
    small {
      display: block;
    }

    span {
      color: #667085;
      font-size: 13px;
    }

    strong {
      margin-top: 6px;
      color: #111827;
      font-size: 28px;
      line-height: 34px;
    }

    small {
      margin-top: 4px;
      color: #20b56b;
    }
  }

  .report-table-card {
    min-width: 0;
    overflow: hidden;
  }

  .table-title {
    color: #172033;
    font-size: 15px;
    font-weight: 800;
  }

  .status-dot {
    font-weight: 700;
  }

  .closure-cell {
    display: grid;
    grid-template-columns: minmax(80px, 1fr) 48px;
    gap: 8px;
    align-items: center;

    span {
      color: #172033;
      font-weight: 700;
    }
  }

  .report-preview {
    color: #172033;
  }

  .preview-cover {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border: 1px solid #dce8ff;
    border-radius: 8px;
    background: linear-gradient(135deg, #f4f8ff, #fff);

    span {
      color: var(--el-color-primary);
      font-weight: 700;
    }

    h2 {
      margin: 6px 0 0;
      font-size: 22px;
    }
  }

  .preview-metrics,
  .report-section-grid {
    display: grid;
    gap: 10px;
  }

  .preview-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-top: 14px;

    div {
      padding: 12px;
      border-radius: 8px;
      background: #f8fbff;
    }

    span,
    strong {
      display: block;
    }

    span {
      color: #8b95a5;
      font-size: 12px;
    }

    strong {
      margin-top: 4px;
      font-size: 22px;
    }
  }

  .report-section-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));

    div {
      padding: 12px;
      color: #1f6feb;
      font-weight: 700;
      text-align: center;
      border: 1px dashed rgb(31 111 235 / 30%);
      border-radius: 8px;
      background: rgb(31 111 235 / 5%);
    }
  }

  @media (max-width: 1000px) {
    .report-summary-grid,
    .preview-metrics,
    .report-section-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .report-header,
    .page-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .page-heading span {
      white-space: normal;
    }
  }
</style>
