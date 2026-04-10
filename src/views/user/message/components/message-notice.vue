<template>
  <div>
    <y-pro-table
      ref="tableRef"
      row-key="id"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      v-model:selections="selections"
      :highlight-current-row="true"
      :export-config="{ fileName: '系统通知数据' }"
    >
      <template #toolbar>
        <el-button
          v-permission="'user:message:status'"
          type="primary"
          class="y-btn-icon"
          @click="confirm()"
        >
          批量确认
        </el-button>
        <el-button
          v-permission="'user:message:remove'"
          type="danger"
          class="y-btn-icon"
          @click="remove()"
        >
          删除通知
        </el-button>
      </template>
      <template #status="{ row }">
        <y-text v-if="row.status === 0" type="warning">未确认</y-text>
        <y-text v-else-if="row.status === 1" type="info">已确认</y-text>
      </template>
      <template #action="{ row }">
        <el-link
          v-permission="'user:message:status'"
          type="primary"
          underline="never"
          @click="confirm(row)"
        >
          确认
        </el-link>
        <el-divider direction="vertical" />
        <el-link
          v-permission="'user:message:remove'"
          type="danger"
          underline="never"
          @click="remove(row)"
        >
          删除
        </el-link>
      </template>
    </y-pro-table>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type { PageResult } from '@/api';
  import type {
    DatasourceFunction,
    Columns
  } from 'y-element-ultra/es/y-pro-table/types';
  import {
    pageUserMessages,
    removeUserMessages,
    updateUserMessageStatus
  } from '@/api/user/message';
  import type { UserMessage } from '@/api/user/message/model';

  const emit = defineEmits<{
    (e: 'reload'): void;
  }>();

  const messageIns = useMessage({ inner: true, plain: true });

  /** 表格实例 */
  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);

  /** 表格列配置 */
  const columns = ref<Columns>([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center'
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center'
    },
    {
      prop: 'title',
      label: '通知标题',
      minWidth: 220
    },
    {
      prop: 'time',
      label: '通知时间',
      width: 180,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      slot: 'status',
      formatter: (row) => (row.status == 0 ? '未确认' : '已确认')
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 120,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 列表选中数据 */
  const selections = ref<UserMessage[]>([]);

  /** 刷新 */
  const reload = () => {
    selections.value = [];
    tableRef.value?.reload?.({ page: 1 });
    emit('reload');
  };

  /** 表格数据源 */
  const datasource: DatasourceFunction = async ({ pages, where, orders }) => {
    const res = await $http(
      pageUserMessages({
        messageType: 'notice',
        ...where,
        ...orders,
        ...pages
      }),
      undefined,
      undefined,
      true
    );
    return (res?.data ?? { list: [], count: 0 }) as PageResult<UserMessage>;
  };

  /** 提示成功后刷新 */
  const handleSuccess = (message?: string) => {
    messageIns.success(message || '操作成功');
    reload();
  };

  /** 确认 */
  const confirm = (row?: UserMessage) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      messageIns.error('请至少选择一条数据');
      return;
    }
    $http(
      updateUserMessageStatus(
        'notice',
        rows.map((item) => item.id)
      ),
      (res) => {
        handleSuccess(res.message);
      },
      (e) => {
        messageIns.error(e.message);
      },
      true
    );
  };

  /** 删除 */
  const remove = (row?: UserMessage) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      messageIns.error('请至少选择一条数据');
      return;
    }
    $http(
      removeUserMessages(rows.map((item) => item.id)),
      (res) => {
        handleSuccess(res.message);
      },
      (e) => {
        messageIns.error(e.message);
      },
      true
    );
  };
</script>
