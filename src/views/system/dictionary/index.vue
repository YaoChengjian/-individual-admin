<template>
  <y-page flex-table="auto" hide-footer :multi-card="false">
    <y-card flex-table="auto" :body-style="{ padding: 0 }">
      <y-split-panel
        flex-table="auto"
        :space="0"
        :size="258"
        allow-collapse
        :collapse-btn-offset="2"
        v-model:collapse="collapse"
        :custom-style="{ borderWidth: '0 1px 0 0' }"
      >
        <template #sideHeader>
          <el-input
            clearable
            :maxlength="20"
            v-model="keywords"
            placeholder="输入字典名称搜索"
            :prefix-icon="SearchOutlined"
          />
        </template>
        <btn-items
          :wrap="false"
          :items="[
            {
              preset: 'add',
              permission: 'system:dictionary:add',
              onClick: () => openTreeEdit()
            },
            {
              preset: 'edit',
              permission: 'system:dictionary:edit',
              props: { disabled: !current },
              onClick: () => openTreeEdit(current)
            },
            {
              preset: 'del',
              permission: 'system:dictionary:remove',
              props: { disabled: !current },
              onClick: () => removeTree()
            }
          ]"
          style="padding: 12px 0 12px 12px"
        />
        <y-loading
          :loading="loading"
          :style="{ flex: '1 1 60px', padding: '0 0 12px 0', overflow: 'auto' }"
        >
          <el-tree
            ref="treeRef"
            :data="data"
            highlight-current
            node-key="dictId"
            :props="{ label: 'dictName' }"
            :expand-on-click-node="false"
            :default-expand-all="true"
            :filter-node-method="filterNode"
            :current-node-key="current?.dictId"
            :style="{
              '--y-tree-item-height': '34px',
              padding: '0 calc(var(--y-tree-item-radius) * 3)'
            }"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data: d }">
              <div
                class="el-tree-node__label"
                :title="`${node.label}(${d.dictCode})`"
                style="overflow: visible"
              >
                <el-icon
                  :style="{
                    margin:
                      '0 4px 0 calc(-10px - var(--y-tree-item-radius) / 2)',
                    verticalAlign: '-2px'
                  }"
                >
                  <BookOutlined />
                </el-icon>
                <span style="margin-right: 4px">{{ node.label }}</span>
                <span
                  style="font-size: 12px; opacity: 0.8; font-weight: normal"
                >
                  ({{ d.dictCode }})
                </span>
              </div>
            </template>
          </el-tree>
        </y-loading>
        <template #bodyHeader>
          <dict-data-search
            :dictId="current?.dictId"
            @search="(where) => reload(where, 1)"
          />
        </template>
        <template #body>
          <y-pro-table
            ref="tableRef"
            row-key="dictDataId"
            :columns="columns"
            :datasource="datasource"
            :show-overflow-tooltip="true"
            v-model:selections="selections"
            :highlight-current-row="true"
            :export-config="{ fileName: '字典数据', datasource: exportSource }"
            :print-config="{ datasource: exportSource }"
            :load-on-created="false"
            cache-key="SystemDictionaryTable"
          >
            <template #toolbar>
              <btn-items
                :items="[
                  {
                    preset: 'add',
                    permission: 'system:dictionary-data:add',
                    onClick: () => openEdit()
                  },
                  {
                    preset: 'del',
                    permission: 'system:dictionary-data:remove',
                    onClick: () => remove()
                  }
                ]"
              />
            </template>
            <template #action="{ row }">
              <btn-items
                divider
                type="link"
                :items="[
                  {
                    preset: 'edit',
                    permission: 'system:dictionary-data:edit',
                    onClick: () => openEdit(row)
                  },
                  {
                    preset: 'del',
                    permission: 'system:dictionary-data:remove',
                    onClick: () => remove(row)
                  }
                ]"
              />
            </template>
            <template #color="{ row }">
              <span v-if="row.color" class="dict-color-cell">
                <span class="dict-color-swatch" :style="{ background: row.color }" />
                <span>{{ row.color }}</span>
              </span>
              <span v-else>-</span>
            </template>
            <template #ripple="{ row }">
              <el-tag
                size="small"
                :type="row.ripple ? 'success' : 'info'"
                :disable-transitions="true"
              >
                {{ row.ripple ? '开启' : '关闭' }}
              </el-tag>
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
  import { YMessage, useModal } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    DatasourceFunction,
    Columns
  } from 'y-element-ultra/es/y-pro-table/types';
  import { SearchOutlined, BookOutlined } from '@/components/icons';
  import { useMobile } from '@/utils/use-mobile';
  import DictDataSearch from './components/dict-data-search.vue';
  import { listDictionaries, removeDictionary } from '@/api/system/dictionary';
  import type { Dictionary } from '@/api/system/dictionary/model';
  import {
    pageDictionaryData,
    removeDictionaryDataBatch,
    listDictionaryData
  } from '@/api/system/dictionary-data';
  import type {
    DictionaryData,
    DictionaryDataParam
  } from '@/api/system/dictionary-data/model';

  defineOptions({ name: 'SystemDictionary' });

  const { openModal } = useModal();
  const { mobile } = useMobile();

  /** 分割面板是否折叠 */
  const collapse = ref(mobile.value);

  /** 树组件 */
  const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

  /** 加载状态 */
  const loading = ref(true);

  /** 树数据 */
  const data = ref<Dictionary[]>([]);

  /** 树选中数据 */
  const current = ref<Dictionary | null>(null);

  /** 树搜索关键字 */
  const keywords = ref('');

  /** 查询 */
  const query = () => {
    loading.value = true;
    listDictionaries()
      .then((list) => {
        loading.value = false;
        data.value = list ?? [];
        handleNodeClick(data.value[0]);
      })
      .catch((e) => {
        loading.value = false;
        YMessage.error({ message: e.message, plain: true });
      });
  };

  /** 选择数据 */
  const handleNodeClick = (row?: Dictionary) => {
    if (row && row.dictId) {
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
  const filterNode = (value: string, data: Dictionary) => {
    if (value) {
      return !!(data.dictName && data.dictName.includes(value));
    }
    return true;
  };

  /** 树过滤 */
  watch(keywords, (value) => {
    treeRef.value?.filter?.(value);
  });

  /** 打开树编辑弹窗 */
  const openTreeEdit = (row?: Dictionary | null) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/dict-edit.vue'),
      componentProps: { data: row, onDone: () => query() }
    });
  };

  /** 删除树 */
  const removeTree = () => {
    const row = current.value;
    if (!row) {
      return;
    }
    ElMessageBox.confirm(`确定要删除“${row.dictName}”吗?`, '系统提示', {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeDictionary(row.dictId)
          .then((msg) => {
            loading.close();
            YMessage.success({ message: msg, plain: true });
            query();
          })
          .catch((e) => {
            loading.close();
            YMessage.error({ message: e.message, plain: true });
          });
      })
      .catch(() => {});
  };

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
      prop: 'dictDataName',
      label: '字典数据名',
      sortable: 'custom',
      minWidth: 120
    },
    {
      prop: 'dictDataCode',
      label: '字典数据值',
      sortable: 'custom',
      minWidth: 120
    },
    {
      prop: 'color',
      label: '颜色',
      width: 130,
      align: 'center',
      slot: 'color'
    },
    {
      prop: 'ripple',
      label: '波纹',
      width: 90,
      align: 'center',
      slot: 'ripple'
    },
    {
      prop: 'sortNumber',
      label: '排序号',
      sortable: 'custom',
      width: 100,
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
      width: 156,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  /** 表格选中数据 */
  const selections = ref<DictionaryData[]>([]);

  /** 表格数据源 */
  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    return pageDictionaryData({
      ...where,
      ...orders,
      ...pages,
      dictId: current.value?.dictId
    });
  };

  /** 刷新表格 */
  const reload = (where?: DictionaryDataParam, page?: number) => {
    selections.value = [];
    tableRef.value?.reload?.({ where, page });
  };

  /** 打开编辑弹窗 */
  const openEdit = (row?: DictionaryData) => {
    openModal({
      custom: true,
      asyncComponent: () => import('./components/dict-data-edit.vue'),
      componentProps: {
        data: row,
        dictId: current.value?.dictId,
        onDone: () => reload()
      }
    });
  };

  /** 删除 */
  const remove = (row?: DictionaryData) => {
    const rows = row == null ? selections.value : [row];
    if (!rows.length) {
      YMessage.error({ message: '请至少选择一条数据', plain: true });
      return;
    }
    ElMessageBox.confirm(
      `确定要删除“${rows.map((d) => d.dictDataName).join(', ')}”吗?`,
      '系统提示',
      { type: 'warning', draggable: true }
    )
      .then(() => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        removeDictionaryDataBatch(rows.map((d) => d.dictDataId))
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

  /** 导出和打印全部数据的数据源 */
  const exportSource: DatasourceFunction = ({ where, orders }) => {
    return listDictionaryData({
      ...where,
      ...orders,
      dictId: current.value?.dictId
    });
  };

  /** 查询树数据 */
  query();
</script>

<style lang="scss" scoped>
  .dict-color-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dict-color-swatch {
    width: 12px;
    height: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 50%;
  }
</style>
