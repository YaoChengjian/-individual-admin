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
            :data="orgTree"
            highlight-current
            node-key="organizationId"
            :props="{ label: 'organizationName' }"
            :expand-on-click-node="false"
            :default-expand-all="true"
            :filter-node-method="filterNode"
            :current-node-key="current?.organizationId"
            :style="{
              '--y-tree-item-height': '34px',
              '--y-tree-expand-margin': '0 2px 0 calc(8px - var(--y-tree-item-radius))',
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
          <member-search
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
            :load-on-created="false"
            cache-key="SystemMemberTable"
          >
            <template #toolbar>
              <btn-items
                :items="[
                  {
                    preset: 'add',
                    permission: 'system:member:add',
                    onClick: () => openEdit()
                  },
                  {
                    title: '邀请成员',
                    permission: 'system:member:invite',
                    onClick: () => openInvite()
                  },
                  {
                    preset: 'del',
                    permission: 'system:member:remove',
                    onClick: () => remove()
                  }
                ]"
              />
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
            <template #dataScope="{ row }">
              <el-tag
                size="small"
                :type="dataScopeTagType[row.dataScope || 'tenant'] || 'info'"
                :disable-transitions="true"
              >
                {{ dataScopeLabel[row.dataScope || 'tenant'] || row.dataScope }}
              </el-tag>
            </template>
            <template #adminFlag="{ row }">
              <el-tag
                size="small"
                :type="row.isOwner ? 'danger' : row.isAdmin ? 'success' : 'info'"
                :disable-transitions="true"
              >
                {{ row.isOwner ? '拥有者' : row.isAdmin ? '管理员' : '成员' }}
              </el-tag>
            </template>
            <template #status="{ row }">
              <el-switch
                v-permission="'system:member:status'"
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
                    permission: 'system:member:edit',
                    onClick: () => openEdit(row)
                  },
                  {
                    title: '重置密码',
                    permission: 'system:user:reset-password',
                    onClick: () => handleUpdatePassword(row)
                  },
                  {
                    preset: 'del',
                    permission: 'system:member:remove',
                    onClick: () => remove(row)
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
  import { ElMessageBox } from 'element-plus';
  import type { ElTree } from 'element-plus';
  import { YMessage, toTree, useModal } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type { DatasourceFunction, Columns } from 'y-element-ultra/es/y-pro-table/types';
  import { CityOutlined, SearchOutlined } from '@/components/icons';
  import { useMobile } from '@/utils/use-mobile';
  import MemberSearch from './components/member-search.vue';
  import { listOrganizations } from '@/api/system/organization';
  import type { Organization } from '@/api/system/organization/model';
  import {
    pageMembers,
    removeMembers,
    updateMemberStatus
  } from '@/api/system/member';
  import type { Member, MemberParam } from '@/api/system/member/model';
  import { updateUserPassword } from '@/api/system/user';

  defineOptions({ name: 'SystemMember' });

  const { openModal } = useModal();
  const { mobile } = useMobile();

  const collapse = ref(mobile.value);
  const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const loading = ref(true);
  const orgTree = ref<Organization[]>([]);
  const current = ref<Organization | null>(null);
  const keywords = ref('');
  const selections = ref<Member[]>([]);

  const dataScopeLabel: Record<string, string> = {
    self: '仅本人',
    organization: '本机构',
    tenant: '当前租户',
    all: '全部数据'
  };

  const dataScopeTagType: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    self: 'info',
    organization: 'warning',
    tenant: 'success',
    all: 'danger'
  };

  const columns = ref<Columns>([
    { type: 'selection', columnKey: 'selection', width: 50, align: 'center', showOverflowTooltip: false },
    { type: 'index', columnKey: 'index', width: 50, align: 'center' },
    { prop: 'username', label: '成员账号', sortable: 'custom', minWidth: 120 },
    { prop: 'nickname', label: '成员名称', sortable: 'custom', minWidth: 120 },
    { prop: 'organizationName', label: '所属机构', minWidth: 130 },
    { prop: 'roles', label: '角色', minWidth: 180, slot: 'roles' },
    { prop: 'adminFlag', label: '成员类型', width: 100, align: 'center', slot: 'adminFlag' },
    { prop: 'dataScope', label: '数据权限', width: 110, align: 'center', slot: 'dataScope' },
    { prop: 'lastActiveAt', label: '最近活跃', width: 180, align: 'center' },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      slot: 'status',
      formatter: (row) => (row.status === 0 ? '正常' : '冻结')
    },
    { prop: 'createTime', label: '加入时间', sortable: 'custom', width: 180, align: 'center' },
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

  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    return pageMembers({
      organizationId: current.value?.organizationId,
      ...where,
      ...orders,
      ...pages
    });
  };

  const queryOrganizations = () => {
    loading.value = true;
    $http(
      listOrganizations(),
      (res) => {
        loading.value = false;
        orgTree.value = toTree({
          data: res.data || [],
          idField: 'organizationId',
          parentIdField: 'parentId'
        });
        handleNodeClick(orgTree.value[0]);
      },
      (e) => {
        loading.value = false;
        YMessage.error({ message: e.message, plain: true });
      }
    );
  };

  const handleNodeClick = (row?: Organization) => {
    current.value = row?.organizationId ? row : null;
    reload({}, 1);
    if (current.value != null && mobile.value) {
      collapse.value = true;
    }
  };

  const filterNode = (value: string, data: Organization) => {
    if (value) {
      return !!(data.organizationName && data.organizationName.includes(value));
    }
    return true;
  };

  watch(keywords, (value) => treeRef.value?.filter?.(value));

  const reload = (where?: MemberParam, page?: number) => {
    selections.value = [];
    tableRef.value?.reload?.({ where, page });
  };

  const openEdit = (row?: Member) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/member-edit.vue'),
      componentProps: {
        data: row,
        organizationId: current.value?.organizationId,
        onDone: () => reload()
      }
    });
  };

  const openInvite = () => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/member-invite.vue'),
      componentProps: { onDone: () => reload() }
    });
  };

  const editStatus = (checked: boolean, row: Member) => {
    updateMemberStatus(row.userId, checked ? 0 : 1)
      .then((msg) => {
        YMessage.success({ message: msg, plain: true });
        reload();
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
        reload();
      });
  };

  const handleUpdatePassword = (row: Member) => {
    ElMessageBox.prompt('请输入重置后的密码', '系统提示', {
      inputValue: '123456',
      inputPattern: /^[\S]{5,18}$/,
      inputErrorMessage: '密码必须为5-18位非空白字符',
      draggable: true
    })
      .then((payload: any) => {
        const value = typeof payload === 'string' ? payload : payload?.value;
        const loading = YMessage.loading({ message: '请求中..', plain: true });
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

  const remove = (row?: Member) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      YMessage.error({ message: '请至少选择一条数据', plain: true });
      return;
    }
    ElMessageBox.confirm(
      `确定要移除“${rows.map((d) => d.nickname).join('、')}”吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = YMessage.loading({ message: '请求中..', plain: true });
        removeMembers(rows.map((d) => d.userId))
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

  queryOrganizations();
</script>
