<template>
  <y-card
    header="待处理工单"
    :body-style="{ padding: '10px', height: '310px' }"
    class="pending-workorder-card"
  >
    <y-pro-table
      row-key="code"
      :columns="columns"
      :datasource="workorders"
      :show-overflow-tooltip="true"
      :pagination="false"
      :toolbar="false"
      :bottom-line="false"
      highlight-current-row
      size="large"
      class="pending-workorder-table"
    >
      <template #status="{ row }">
        <y-dot
          v-if="row"
          :text="row.status"
          :type="row.statusType"
          :color="row.statusColor"
          size="7px"
          ripple
          class="workorder-status"
          :class="row.statusClass"
        />
      </template>
    </y-pro-table>
  </y-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { Columns } from 'y-element-ultra/es/y-pro-table/types';

  type WorkorderStatus = '待处理' | '待派单' | '处理中' | '已完成';

  interface Workorder {
    code: string;
    title: string;
    reporter: string;
    status: WorkorderStatus;
    reportTime: string;
    statusType?: 'success' | 'warning' | 'danger';
    statusColor?: string;
    statusClass: string;
  }

  const columns = ref<Columns>([
    {
      prop: 'code',
      label: '工单编号',
      minWidth: 130
    },
    {
      prop: 'title',
      label: '事件标题',
      minWidth: 180
    },
    {
      prop: 'reporter',
      label: '上报人',
      width: 110,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      align: 'center',
      slot: 'status'
    },
    {
      prop: 'reportTime',
      label: '上报时间',
      width: 150,
      align: 'center'
    }
  ]);

  const workorders = ref<Workorder[]>([
    {
      code: 'GD20260515001',
      title: '巡查点位围挡破损',
      reporter: '陈志强',
      status: '待处理',
      reportTime: '05-15 09:12:18',
      statusType: 'danger',
      statusClass: 'is-pending'
    },
    {
      code: 'GD20260515002',
      title: '商户占道经营待核查',
      reporter: '李雨晴',
      status: '待派单',
      reportTime: '05-15 09:18:43',
      statusType: 'warning',
      statusClass: 'is-wait-dispatch'
    },
    {
      code: 'GD20260515003',
      title: '门头招牌异常识别',
      reporter: '王浩',
      status: '处理中',
      reportTime: '05-15 09:26:05',
      statusColor: 'var(--el-color-primary)',
      statusClass: 'is-processing'
    },
    {
      code: 'GD20260515004',
      title: '整改通知书已送达',
      reporter: '赵敏',
      status: '已完成',
      reportTime: '05-15 09:31:22',
      statusType: 'success',
      statusClass: 'is-finished'
    },
    {
      code: 'GD20260515005',
      title: '垃圾堆放超时未清理',
      reporter: '周凯',
      status: '待处理',
      reportTime: '05-15 09:42:36',
      statusType: 'danger',
      statusClass: 'is-pending'
    }
  ]);
</script>

<style lang="scss" scoped>
  .pending-workorder-card {
    :deep(.el-card__body) {
      overflow: hidden;
    }
  }

  .pending-workorder-table {
    height: 100%;

    :deep(.y-pro-table) {
      height: 100%;
    }

    :deep(.y-dot-text) {
      color: inherit;
      margin-left: 6px;
      font-weight: 700;
    }
  }

  .workorder-status {
    font-size: 13px;
    font-weight: 700;

    &.is-finished {
      color: var(--el-color-success);
    }

    &.is-processing {
      color: var(--el-color-primary);
    }

    &.is-wait-dispatch {
      color: var(--el-color-warning);
    }

    &.is-pending {
      color: var(--el-color-danger);
    }
  }
</style>
