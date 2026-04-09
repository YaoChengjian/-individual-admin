<template>
  <y-page>
    <organization-search @search="reload" />
    <y-card :body-style="{ paddingTop: '8px' }">
      <y-pro-table
        sticky
        ref="tableRef"
        row-key="organizationId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        :export-config="{ fileName: '机构数据' }"
        :default-expand-all="true"
        :pagination="false"
        cache-key="SystemOrganizationTable"
      >
        <template #toolbar>
          <btn-items
            :items="[
              { preset: 'add', onClick: () => openEdit() },
              { preset: 'expand', onClick: () => expandAll() },
              { preset: 'fold', onClick: () => foldAll() }
            ]"
          />
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[
              {
                preset: 'add',
                onClick: () => openEdit(null, row.organizationId)
              },
              { preset: 'edit', onClick: () => openEdit(row) },
              { preset: 'del', onClick: () => remove(row) }
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
  import { YMessage, useModal, toTree } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    DatasourceFunction,
    Columns
  } from 'y-element-ultra/es/y-pro-table/types';
  import OrganizationSearch from './components/organization-search.vue';
  import {
    listOrganizations,
    removeOrganization
  } from '@/api/system/organization';
  import type {
    Organization,
    OrganizationParam
  } from '@/api/system/organization/model';

  defineOptions({ name: 'SystemOrganization' });

  const { openModal } = useModal();

  /** 表格实例 */
  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);

  /** 表格列配置 */
  const columns = ref<Columns>([
    {
      type: 'index',
      columnKey: 'index',
      width: 50,
      align: 'center'
    },
    {
      prop: 'organizationName',
      label: '机构名称',
      sortable: 'custom',
      minWidth: 160
    },
    {
      prop: 'organizationTypeName',
      label: '机构类型',
      minWidth: 100,
      align: 'center'
    },
    {
      prop: 'sortNumber',
      label: '排序号',
      minWidth: 100,
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
      width: 220,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格数据源 */
  const datasource: DatasourceFunction = async ({ where, orders }) => {
    const res = await $http(listOrganizations({ ...where, ...orders }));
    return toTree({
      data: res.data || [],
      idField: 'organizationId',
      parentIdField: 'parentId'
    });
  };

  /** 刷新表格 */
  const reload = (where?: OrganizationParam) => {
    tableRef.value?.reload?.({ where });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row?: Organization | null, id?: number) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/organization-edit.vue'),
      componentProps: { data: row, organizationId: id, onDone: () => reload() }
    });
  };

  /** 删除单个 */
  const remove = (row: Organization) => {
    if (row.children?.length) {
      YMessage.error({ message: '请先删除子节点', plain: true });
      return;
    }
    ElMessageBox.confirm(`确定要删除“${row.organizationName}”吗?`, '系统提示', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const messageLoading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        $http(
          removeOrganization(row.organizationId),
          (res) => {
            messageLoading.close();
            YMessage.success({ message: res.message, plain: true });
            reload();
          },
          (e) => {
            messageLoading.close();
            YMessage.error({ message: e.message, plain: true });
          }
        );
      })
      .catch(() => {});
  };

  /** 展开全部 */
  const expandAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(true);
  };

  /** 折叠全部 */
  const foldAll = () => {
    tableRef.value?.toggleRowExpansionAll?.(false);
  };
</script>
