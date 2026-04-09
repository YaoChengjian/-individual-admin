<!-- 角色选择 -->
<template>
  <YTableSelect
    v-bind="{
      ...emitProps,
      ...omit($props, ['viewType', 'itemIcon', 'componentLang'])
    }"
    :popperTitle="popperTitle ?? lang.title"
    popperClass="y-role-select-modal y-modal-show-header-border y-modal-show-footer-border"
    :popperProps="{ flexTable: 'auto', loading, ...(popperProps || {}) }"
    :selectStyle="isPickerMode ? 'none' : selectStyle"
    :validateEvent="!isPickerMode"
    :tableProps="{
      toolbar: false,
      showOverflowTooltip: true,
      rowClickChecked: multiple,
      columns: columns,
      datasource: tableData,
      ...(tableProps || {})
    }"
    :wrapperComponent="BodyWrapper"
    :wrapperComponentProps="{
      multiple: multiple,
      popperType: popperType,
      itemIcon: itemIcon,
      lang: lang,
      onSearch: handleSearch,
      onBodyMounted: handleBodyMounted
    }"
    ref="tableSelectRef"
  >
    <template v-for="name in Object.keys($slots)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </YTableSelect>
</template>

<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { ref, unref, computed } from 'vue';
  import { mapTree } from 'y-element-ultra';
  import { omit } from 'y-element-ultra/es/utils/common';
  import { useComponentEvents } from 'y-element-ultra/es/utils/hook';
  import type { UserComponent } from 'y-element-ultra/es/y-app/types';
  import type { YTableSelectInstance } from 'y-element-ultra/es/y-app/plus';
  import type { PopperType } from 'y-element-ultra/es/y-basic-select/types';
  import type { Columns } from 'y-element-ultra/es/y-pro-table/types';
  import {
    tableSelectProps,
    tableSelectEmits
  } from 'y-element-ultra/es/y-table-select/props';
  import { useComponentLang } from '@/utils/use-component-lang';
  import BodyWrapper from './components/body-wrapper.vue';
  import {
    roleIdField,
    roleNameField,
    roleTableColumns,
    listRoleApi
  } from './config';
  import type { RoleSelectLocale, Role, RoleParam } from './types';

  defineOptions({ name: 'RoleSelect' });

  const props = defineProps({
    ...tableSelectProps,
    popperWidth: { type: [Number, String], default: 980 },
    popperHeight: { type: [Number, String], default: 680 },
    valueKey: { type: String, default: roleIdField },
    labelKey: { type: String, default: roleNameField },
    popperType: { type: String as PropType<PopperType>, default: 'modal' },
    /** 显示模式 */
    viewType: String as PropType<'select' | 'picker'>,
    /** 已选列表项图标组件 */
    itemIcon: [String, Object, Function] as PropType<UserComponent>,
    /** 自定义文案 */
    componentLang: { type: Object as PropType<Partial<RoleSelectLocale>> }
  });

  const emit = defineEmits(tableSelectEmits);

  const { emitProps } = useComponentEvents(tableSelectEmits, emit);

  const { lang } = useComponentLang<RoleSelectLocale>(
    {
      zh_CN: {
        title: '角色选择',
        clear: '清空',
        selected: '已选择 ',
        selectedUnit: ' 个',
        labelRoleName: '角色名称',
        labelRoleCode: '角色标识',
        labelComments: '备注',
        labelCreateTime: '创建时间'
      },
      zh_TW: {
        title: '角色選擇',
        clear: '清空',
        selected: '已選擇 ',
        selectedUnit: ' 個',
        labelRoleName: '角色名稱',
        labelRoleCode: '角色標識',
        labelComments: '備註',
        labelCreateTime: '創建時間'
      },
      en: {
        title: 'Role select',
        clear: 'Clear',
        selected: 'Selected ',
        selectedUnit: ' items',
        labelRoleName: 'RoleName',
        labelRoleCode: 'RoleCode',
        labelComments: 'Comments',
        labelCreateTime: 'CreateTime'
      }
    },
    props
  );

  /** 表格下拉组件 */
  const tableSelectRef = ref<YTableSelectInstance>(null);

  /** 表格数据请求状态 */
  const loading = ref(false);

  /** 表格数据 */
  const tableData = ref<Role[]>([]);

  /** 表格列配置 */
  const columns = computed<Columns>(() => {
    const cols: Columns = [];
    if (props.multiple) {
      cols.push({
        type: 'selection',
        columnKey: 'selection',
        width: 48,
        align: 'center',
        showOverflowTooltip: false,
        reserveSelection: true
      });
    }
    cols.push({
      type: 'index',
      columnKey: 'index',
      width: 48,
      align: 'center'
    });
    return [
      ...cols,
      ...mapTree(roleTableColumns, (c) => ({
        ...c,
        label: (c.label ? lang.value[c.label] : void 0) ?? c.label
      }))
    ];
  });

  /** 是否是选择器模式 */
  const isPickerMode = computed(() => {
    return props.viewType === 'picker';
  });

  /** 搜索 */
  const handleSearch = (where: RoleParam) => {
    if (!props.tableProps?.datasource) {
      reload(where);
      return;
    }
    const tableRef = unref(tableSelectRef.value?.tableRef);
    if (tableRef) {
      tableRef.reload({ page: 1, where });
    }
  };

  /** 查询表格数据 */
  const reload = (where?: RoleParam) => {
    if (props.tableProps?.datasource) {
      return;
    }
    loading.value = true;
    listRoleApi(where || {})
      .then((data) => {
        tableData.value = data;
        loading.value = false;
      })
      .catch((e) => {
        loading.value = false;
        console.error(e);
      });
  };

  /** 内容挂载事件 */
  const handleBodyMounted = () => {
    if (
      isPickerMode.value ||
      ((props.popperProps as any)?.destroyOnClose ?? !props.persistent)
    ) {
      reload();
    }
  };

  /** 弹窗模式首次查询 */
  if (
    !isPickerMode.value &&
    !((props.popperProps as any)?.destroyOnClose ?? !props.persistent)
  ) {
    reload();
  }

  defineExpose({ tableSelectRef, reload });
</script>

<style lang="scss">
  @use 'y-element-ultra/es/style/util.scss' as *;
  @use 'y-element-ultra/es/y-pro-table/style/css-var.scss' as *;

  /* 弹框 */
  .y-role-select-modal {
    .y-modal-body,
    .y-drawer-body {
      padding: 0;
    }

    &.y-table-select-popper .y-popover-body {
      padding: 0;

      & > .y-role-select-wrapper {
        height: 100%;
      }
    }
  }

  .y-role-select-wrapper {
    flex: auto;
    display: flex;
  }

  /* 表格 */
  .y-role-select-body {
    flex: 1;
    padding: 12px 16px 0 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @include flex-auto-pro-table();

    & > .y-pro-table {
      padding-bottom: 10px;

      & > .y-pro-table-footer > .y-pagination {
        padding-top: 0;
      }

      .el-table__row {
        cursor: pointer;
      }
    }

    & > .y-role-select-search {
      margin-bottom: 4px;
    }

    .el-form-item {
      margin-bottom: 8px;
    }
  }

  /* 选中列表 */
  .y-role-select-right {
    width: 180px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-left: 1px solid elVar('border-color', 'light');
    display: flex;
    flex-direction: column;
  }

  .y-role-select-right-header {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
  }

  .y-role-select-right-title {
    flex: 1;
    width: 100%;
    overflow: hidden;
    padding-right: 8px;
    box-sizing: border-box;
    font-size: 13px;
  }

  .y-role-select-right-clear {
    width: 100%;
    padding: 0 6px;
    margin-top: 6px;
    border-radius: elVar('border-radius', 'base');
    border: 1px dashed elVar('color-danger');
    box-sizing: border-box;
    font-size: 12px;
    line-height: 20px;
    user-select: none;

    &:hover {
      border-color: elVar('color-danger', 'light-5');
    }
  }

  .y-role-select-right-body {
    flex: 1 1 60px;
    padding: 0 10px;
    box-sizing: border-box;
    user-select: none;
    overflow: auto;

    &.is-sortable .y-role-select-right-item {
      cursor: move;
    }
  }

  /* 选中列表项 */
  .y-role-select-right-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 4px;
    margin-bottom: 8px;
    border: 1px solid elVar('border-color');
    border-radius: elVar('border-radius', 'base');
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:hover {
      border-color: elVar('color-primary', 'light-3');
    }

    &.sortable-chosen {
      background: elVar('bg-color');
    }

    &.sortable-ghost {
      opacity: 0;
    }

    &.sortable-fallback {
      opacity: 1 !important;
    }
  }

  .y-role-select-right-label {
    flex: 1;
    line-height: 16px;
    margin-left: 4px;
    word-break: break-all;
    overflow: hidden;
  }

  .y-role-select-right-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .y-role-select-right-del {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    font-size: 12px;
    color: elVar('color-danger');
    border-radius: elVar('border-radius', 'small');
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      background: elVar('fill-color', 'light');
    }
  }

  /* 移动端适配 */
  @media screen and (max-width: 767.99px) {
    .y-role-select-body > .y-pro-table {
      padding-bottom: 8px;
    }

    .y-role-select-wrapper {
      flex-direction: column;
    }

    .y-role-select-right {
      width: auto;
      border-left: none;
      border-top: 1px solid elVar('border-color', 'light');
    }

    .y-role-select-right-body {
      flex: none;
      display: flex;
      min-height: 42px;
      overflow: auto;
    }

    .y-role-select-right-item {
      width: max-content;

      & + .y-role-select-right-item {
        margin-left: 8px;
      }
    }

    .y-role-select-right-header {
      padding-top: 8px;
      padding-bottom: 8px;
      flex-direction: row;

      & > .y-role-select-right-title,
      & > .y-role-select-right-clear {
        width: auto;
        margin: 0;
      }
    }
  }
</style>
