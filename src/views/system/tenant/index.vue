<template>
  <y-page>
    <tenant-search @search="(where) => reload(where, 1)" />
    <y-card :body-style="{ paddingTop: '8px' }">
      <y-pro-table
        ref="tableRef"
        row-key="tenantId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        v-model:selections="selections"
        :highlight-current-row="true"
        cache-key="SystemTenantTable"
      >
        <template #toolbar>
          <btn-items
            :items="[
              {
                preset: 'add',
                permission: 'system:tenant:add',
                onClick: () => openEdit()
              },
              {
                preset: 'del',
                permission: 'system:tenant:remove',
                onClick: () => remove()
              }
            ]"
          />
        </template>
        <template #isolationLevel="{ row }">
          <el-tag
            size="small"
            :type="isolationTagType[row.isolationLevel || 'strict'] || 'info'"
            :disable-transitions="true"
          >
            {{ isolationLabel[row.isolationLevel || 'strict'] || row.isolationLevel }}
          </el-tag>
        </template>
        <template #status="{ row }">
          <el-switch
            v-permission="'system:tenant:status'"
            size="small"
            :model-value="row.status === 0"
            @change="(checked: boolean) => handleUpdateStatus(checked, row)"
          />
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[
              {
                preset: 'edit',
                permission: 'system:tenant:edit',
                onClick: () => openEdit(row)
              },
              {
                preset: 'del',
                permission: 'system:tenant:remove',
                onClick: () => remove(row)
              }
            ]"
          />
        </template>
      </y-pro-table>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { ElMessageBox } from 'element-plus';
  import { YMessage, useModal } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import TenantSearch from './components/tenant-search.vue';
  import {
    pageTenants,
    removeTenants,
    updateTenantStatus
  } from '@/api/system/tenant';
  import type { Tenant, TenantParam } from '@/api/system/tenant/model';

  defineOptions({ name: 'SystemTenant' });

  const { openModal } = useModal();

  /** 表格实例 */
  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);

  /** 选中数据 */
  const selections = ref<Tenant[]>([]);

  /** 隔离级别显示 */
  const isolationLabel: Record<string, string> = {
    strict: '独立隔离',
    logical: '同库隔离',
    shared: '平台共享'
  };

  /** 隔离级别标记颜色 */
  const isolationTagType: Record<string, 'success' | 'warning' | 'info'> = {
    strict: 'success',
    logical: 'warning',
    shared: 'info'
  };

  /** 列配置 */
  const columns = ref<Columns>([
    {
      type: 'selection',
      columnKey: 'selection',
      width: 50,
      align: 'center',
      showOverflowTooltip: false
    },
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center'
    },
    {
      prop: 'tenantName',
      label: '租户名称',
      sortable: 'custom',
      minWidth: 160
    },
    {
      prop: 'tenantCode',
      label: '租户编码',
      sortable: 'custom',
      minWidth: 140
    },
    {
      prop: 'contactName',
      label: '联系人',
      minWidth: 120
    },
    {
      prop: 'contactPhone',
      label: '联系电话',
      minWidth: 140
    },
    {
      prop: 'memberCount',
      label: '成员数',
      width: 100,
      align: 'center'
    },
    {
      prop: 'isolationLevel',
      label: '隔离级别',
      width: 120,
      align: 'center',
      slot: 'isolationLevel'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      slot: 'status',
      formatter: (row) => (row.status === 0 ? '启用' : '停用')
    },
    {
      prop: 'expireTime',
      label: '到期时间',
      width: 120,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      sortable: 'custom',
      width: 180,
      align: 'center'
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 180,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 数据源 */
  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    return pageTenants({ ...where, ...orders, ...pages });
  };

  /** 刷新 */
  const reload = (where?: TenantParam, page?: number) => {
    selections.value = [];
    tableRef.value?.reload?.({ where, page });
  };

  /** 打开编辑 */
  const openEdit = (row?: Tenant) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/tenant-edit.vue'),
      componentProps: { data: row, onDone: () => reload() }
    });
  };

  /** 更新状态 */
  const handleUpdateStatus = (checked: boolean, row: Tenant) => {
    updateTenantStatus({
      tenantId: row.tenantId,
      status: checked ? 0 : 1
    })
      .then((msg) => {
        YMessage.success({ message: msg, plain: true });
        reload();
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
        reload();
      });
  };

  /** 删除 */
  const remove = (row?: Tenant) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      YMessage.error({ message: '请至少选择一条数据', plain: true });
      return;
    }
    ElMessageBox.confirm(
      `确定要删除“${rows.map((d) => d.tenantName).join('、')}”吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeTenants(rows.map((d) => d.tenantId))
          .then((msg) => {
            loading.close();
            YMessage.success({ message: msg, plain: true });
            reload();
          })
          .catch((e) => {
            loading.close();
            YMessage.error({ message: e.message, plain: true });
          });
      })
      .catch(() => {});
  };
</script>
