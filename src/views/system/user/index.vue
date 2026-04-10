<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <y-card :body-style="{ padding: 0 }" flex-table="auto">
      <y-split-panel
        :space="0"
        :size="258"
        allow-collapse
        :collapse-btn-offset="2"
        v-model:collapse="collapse"
        :custom-style="{ borderWidth: '0 1px 0 0' }"
        flex-table="auto"
      >
        <template #sideHeader>
          <el-input
            clearable
            :maxlength="20"
            v-model="keywords"
            placeholder="输入机构名称搜索"
            :prefix-icon="SearchOutlined"
          />
        </template>
        <y-loading
          :loading="loading"
          :spinner-style="{ background: 'none' }"
          :style="{ flex: '1 1 60px', overflow: 'auto' }"
        >
          <el-tree
            ref="treeRef"
            :data="data"
            highlight-current
            node-key="organizationId"
            :props="{ label: 'organizationName' }"
            :expand-on-click-node="false"
            :default-expand-all="true"
            :filter-node-method="filterNode"
            :current-node-key="current?.organizationId"
            :style="{
              '--y-tree-item-height': '34px',
              '--y-tree-expand-margin':
                '0 2px 0 calc(8px - var(--y-tree-item-radius))',
              padding: '12px calc(var(--y-tree-item-radius) * 3)'
            }"
            @node-click="handleNodeClick"
          >
            <template #default="{ node }">
              <span class="el-tree-node__label" :title="node.label">
                <el-icon style="margin-right: 4px; vertical-align: -2px">
                  <CityOutlined />
                </el-icon>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </y-loading>
        <template #bodyHeader>
          <user-search
            :organizationId="current?.organizationId"
            @search="(where) => reload(where, 1)"
          />
        </template>
        <template #body>
          <y-pro-table
            ref="tableRef"
            row-key="userId"
            :columns="columns"
            :datasource="datasource"
            :show-overflow-tooltip="true"
            v-model:selections="selections"
            :highlight-current-row="true"
            :export-config="{ fileName: '用户数据', datasource: exportSource }"
            :print-config="{ datasource: exportSource }"
            :load-on-created="false"
            cache-key="SystemUserTable"
          >
            <template #toolbar>
              <btn-items
                :items="[
                  {
                    preset: 'add',
                    permission: 'system:user:add',
                    onClick: () => openEdit()
                  },
                  {
                    preset: 'del',
                    permission: 'system:user:remove',
                    onClick: () => remove()
                  },
                  {
                    preset: 'import',
                    permission: 'system:user:import',
                    onClick: () => openImport()
                  }
                ]"
              />
            </template>
            <template #nickname="{ row }">
              <el-link
                type="primary"
                underline="never"
                @click="openDetail(row)"
              >
                {{ row.nickname }}
              </el-link>
            </template>
            <template #roles="{ row }">
              <el-tag
                v-for="item in row.roles"
                :key="item.roleId"
                size="small"
                :disable-transitions="true"
              >
                {{ item.roleName }}
              </el-tag>
            </template>
            <template #status="{ row }">
              <el-switch
                v-permission="'system:user:status'"
                size="small"
                :model-value="row.status === 0"
                @change="(checked: boolean) => editStatus(checked, row)"
              />
            </template>
            <template #action="{ row }">
              <btn-items
                divider
                type="link"
                :items="[
                  {
                    preset: 'edit',
                    permission: 'system:user:edit',
                    onClick: () => openEdit(row)
                  },
                  {
                    preset: 'more',
                    dropdownItems: [
                      {
                        title: '重置密码',
                        icon: LockOutlined,
                        permission: 'system:user:reset-password',
                        onClick: () => handleUpdatePassword(row)
                      },
                      {
                        title: '删除用户',
                        icon: DeleteOutlined,
                        danger: true,
                        divided: true,
                        permission: 'system:user:remove',
                        onClick: () => remove(row)
                      }
                    ]
                  }
                ]"
              />
            </template>
          </y-pro-table>
        </template>
      </y-split-panel>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessageBox } from 'element-plus';
  import type { ElTree } from 'element-plus';
  import { YMessage, toTree, useModal } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    DatasourceFunction,
    Columns
  } from 'y-element-ultra/es/y-pro-table/types';
  import {
    CityOutlined,
    SearchOutlined,
    DeleteOutlined,
    LockOutlined
  } from '@/components/icons';
  import { usePageTab } from '@/utils/use-page-tab';
  import { useMobile } from '@/utils/use-mobile';
  import UserSearch from './components/user-search.vue';
  import { listOrganizations } from '@/api/system/organization';
  import type { Organization } from '@/api/system/organization/model';
  import {
    pageUsers,
    removeUsers,
    updateUserStatus,
    updateUserPassword,
    listUsers
  } from '@/api/system/user';
  import type { User, UserParam } from '@/api/system/user/model';

  defineOptions({ name: 'SystemUser' });

  const { push } = useRouter();
  const { openModal } = useModal();
  const { addPageTab } = usePageTab();
  const { mobile } = useMobile();

  /** 分割面板是否折叠 */
  const collapse = ref(mobile.value);

  /** 树组件 */
  const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

  /** 加载状态 */
  const loading = ref(true);

  /** 树数据 */
  const data = ref<Organization[]>([]);

  /** 树选中数据 */
  const current = ref<Organization | null>(null);

  /** 树搜索关键字 */
  const keywords = ref('');

  /** 查询树数据 */
  const query = () => {
    loading.value = true;
    $http(
      listOrganizations(),
      (res) => {
        loading.value = false;
        data.value = toTree({
          data: res.data || [],
          idField: 'organizationId',
          parentIdField: 'parentId'
        });
        handleNodeClick(data.value[0]);
      },
      (e) => {
        loading.value = false;
        YMessage.error({ message: e.message, plain: true });
      }
    );
  };

  /** 树选中数据 */
  const handleNodeClick = (row?: Organization) => {
    if (row && row.organizationId) {
      current.value = row;
    } else {
      current.value = null;
    }
    reload({}, 1);
    // 移动端自动收起左侧
    if (current.value != null && mobile.value) {
      collapse.value = true;
    }
  };

  /** 树过滤方法 */
  const filterNode = (value: string, data: Organization) => {
    if (value) {
      return !!(data.organizationName && data.organizationName.includes(value));
    }
    return true;
  };

  /** 树过滤 */
  watch(keywords, (value) => {
    treeRef.value?.filter?.(value);
  });

  /** 表格组件 */
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
      prop: 'username',
      label: '用户账号',
      sortable: 'custom',
      minWidth: 110
    },
    {
      prop: 'nickname',
      label: '用户名',
      sortable: 'custom',
      minWidth: 110,
      slot: 'nickname'
    },
    {
      prop: 'sexName',
      label: '性别',
      sortable: 'custom',
      width: 90,
      align: 'center'
    },
    {
      columnKey: 'roles',
      label: '角色',
      minWidth: 110,
      slot: 'roles',
      align: 'center',
      formatter: (row: User) => (row.roles || []).map((d) => d.roleName).join()
    },
    {
      prop: 'createTime',
      label: '创建时间',
      sortable: 'custom',
      width: 180,
      align: 'center'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      align: 'center',
      sortable: 'custom',
      slot: 'status',
      formatter: (row) => (row.status == 0 ? '正常' : '冻结')
    },
    {
      columnKey: 'action',
      label: '操作',
      width: 148,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格选中数据 */
  const selections = ref<User[]>([]);

  /** 表格数据源 */
  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    return pageUsers({
      ...where,
      ...orders,
      ...pages,
      organizationId: current.value?.organizationId
    });
  };

  /** 搜索 */
  const reload = (where?: UserParam, page?: number) => {
    selections.value = [];
    tableRef.value?.reload?.({ where, page });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row?: User) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/user-edit.vue'),
      componentProps: {
        data: row,
        organizationId: current.value?.organizationId,
        onDone: () => reload()
      }
    });
  };

  /** 打开导入弹窗 */
  const openImport = () => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/user-import.vue'),
      componentProps: { onDone: () => reload() }
    });
  };

  /** 删除 */
  const remove = (row?: User) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      YMessage.error({ message: '请至少选择一条数据', plain: true });
      return;
    }
    ElMessageBox.confirm(
      `确定要删除“${rows.map((d) => d.nickname).join(', ')}”吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeUsers(rows.map((d) => d.userId))
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

  /** 修改用户状态 */
  const editStatus = (checked: boolean, row: User) => {
    const status = checked ? 0 : 1;
    updateUserStatus(row.userId, status)
      .then((msg) => {
        row.status = status;
        YMessage.success({ message: msg, plain: true });
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      });
  };

  /** 修改密码 */
  const handleUpdatePassword = (row: User) => {
    ElMessageBox.prompt(`请输入用户"${row.nickname}"的新密码：`, '重置密码', {
      inputPattern: /^[\S]{5,18}$/,
      inputErrorMessage: '密码必须为5-18位非空白字符',
      draggable: true
    })
      .then(({ value }) => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        updateUserPassword(row.userId, value)
          .then((msg) => {
            loading.close();
            YMessage.success({ message: msg, plain: true });
          })
          .catch((e) => {
            loading.close();
            YMessage.error({ message: e.message, plain: true });
          });
      })
      .catch(() => {});
  };

  /** 导出和打印全部数据的数据源 */
  const exportSource: DatasourceFunction = ({ where, orders }) => {
    return listUsers({
      ...where,
      ...orders,
      organizationId: current.value?.organizationId
    });
  };

  /** 查看详情 */
  const openDetail = (row: User) => {
    const path = `/system/user/details/${row.userId}`;
    addPageTab({
      title: `用户详情[${row.nickname}]`,
      key: path,
      closable: true,
      meta: { icon: 'UserOutlined' }
    });
    push(path);
  };

  /** 查询树数据 */
  query();
</script>
