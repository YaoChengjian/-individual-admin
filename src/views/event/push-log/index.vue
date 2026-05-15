<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <div class="push-page-header">
      <div class="page-heading">
        <h1>推送日志</h1>
        <span>记录第三方治理平台 mock 推送请求、响应与失败原因</span>
      </div>
      <div class="page-actions">
        <el-button size="large" type="primary" @click="reload()"
          >刷新日志</el-button
        >
      </div>
    </div>

    <y-card
      class="push-card"
      flex-table="auto"
      :body-style="{ paddingTop: '8px' }"
    >
      <template #header>
        <div class="table-title">推送记录</div>
      </template>
      <template #extra>
        <el-input
          v-model="query.keywords"
          clearable
          placeholder="搜索请求编号 / 工单编号 / 平台单号"
          style="width: 320px"
          @keyup.enter="reload()"
        />
      </template>
      <y-pro-table
        ref="tableRef"
        row-key="pushRecordId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        cache-key="EventPushLogTable"
        @row-click="openDetail"
      >
        <template #pushStatus="{ row }">
          <y-dot
            :text="row.pushStatusName"
            :color="row.statusColor"
            :ripple="row.statusRipple"
            size="7px"
            class="status-dot"
          />
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[{ title: '查看报文', onClick: () => openDetail(row) }]"
          />
        </template>
      </y-pro-table>
    </y-card>

    <y-modal v-model="detailVisible" title="推送报文" width="820px">
      <div v-if="current" class="payload-view">
        <div class="payload-head">
          <div>
            <span>{{ current.requestId }}</span>
            <h2>{{ current.workOrderNo }}</h2>
          </div>
          <y-dot
            :text="current.pushStatusName"
            :color="current.statusColor"
            :ripple="current.statusRipple"
            size="8px"
          />
        </div>
        <el-descriptions :column="2" size="small" border>
          <el-descriptions-item label="目标平台">{{
            current.targetPlatform
          }}</el-descriptions-item>
          <el-descriptions-item label="平台单号">{{
            current.thirdOrderNo || '-'
          }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{
            current.operatorName
          }}</el-descriptions-item>
          <el-descriptions-item label="推送时间">{{
            current.pushedAt
          }}</el-descriptions-item>
          <el-descriptions-item label="失败原因" :span="2">{{
            current.errorMessage || '-'
          }}</el-descriptions-item>
        </el-descriptions>
        <div class="payload-grid">
          <div>
            <div class="section-title">请求报文</div>
            <pre>{{ formatJson(current.requestBody) }}</pre>
          </div>
          <div>
            <div class="section-title">响应报文</div>
            <pre>{{ formatJson(current.responseBody) }}</pre>
          </div>
        </div>
      </div>
      <el-empty v-else description="请选择推送记录" />
    </y-modal>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import { pagePushRecords } from '@/api/closed-loop';
  import type { ClosedLoopParam, PushRecord } from '@/api/closed-loop/model';

  defineOptions({ name: 'EventPushLog' });

  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const query = ref<ClosedLoopParam>({});
  const current = ref<PushRecord>();
  const detailVisible = ref(false);

  const columns = ref<Columns>([
    { prop: 'requestId', label: '请求编号', minWidth: 190, fixed: 'left' },
    { prop: 'workOrderNo', label: '工单编号', minWidth: 170 },
    { prop: 'targetPlatform', label: '目标平台', minWidth: 180 },
    {
      prop: 'pushStatus',
      label: '推送状态',
      width: 130,
      align: 'center',
      slot: 'pushStatus'
    },
    { prop: 'thirdOrderNo', label: '平台单号', minWidth: 180 },
    { prop: 'operatorName', label: '操作人', width: 130, align: 'center' },
    { prop: 'pushedAt', label: '推送时间', width: 170, align: 'center' },
    { prop: 'errorMessage', label: '失败原因', minWidth: 220 },
    {
      columnKey: 'action',
      label: '操作',
      minWidth: 120,
      fixed: 'right',
      align: 'center',
      slot: 'action',
      showOverflowTooltip: false
    }
  ]);

  const datasource: DatasourceFunction = ({ pages, orders }) => {
    return pagePushRecords({ ...query.value, ...pages, ...orders });
  };

  const reload = () => {
    tableRef.value?.reload?.({ where: query.value, page: 1 });
  };

  const openDetail = (row: PushRecord) => {
    current.value = row;
    detailVisible.value = true;
  };

  const formatJson = (value?: Record<string, unknown>) => {
    return JSON.stringify(value || {}, null, 2);
  };
</script>

<style lang="scss" scoped>
  .push-page-header,
  .page-heading,
  .page-actions,
  .payload-head {
    display: flex;
    align-items: center;
  }

  .push-page-header {
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .page-heading {
    min-width: 0;
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

  .push-card {
    min-width: 0;
    overflow: hidden;
  }

  .table-title,
  .section-title {
    color: #172033;
    font-size: 15px;
    font-weight: 800;
  }

  .status-dot {
    font-weight: 700;
  }

  .payload-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .payload-head {
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border: 1px solid #e8eef7;
    border-radius: 10px;
    background: #f8fbff;

    span {
      color: var(--el-color-primary);
      font-size: 13px;
      font-weight: 800;
    }

    h2 {
      margin: 4px 0 0;
      color: #111827;
      font-size: 20px;
      line-height: 28px;
    }
  }

  .payload-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;

    > div {
      min-width: 0;
      padding: 14px;
      border: 1px solid #edf1f7;
      border-radius: 10px;
      background: #fff;
    }

    pre {
      max-height: 360px;
      margin: 12px 0 0;
      padding: 12px;
      overflow: auto;
      color: #344054;
      font-size: 12px;
      line-height: 1.6;
      border-radius: 8px;
      background: #f6f8fb;
    }
  }
</style>
