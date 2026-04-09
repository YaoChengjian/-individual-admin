<!-- 机构选择下拉框 -->
<template>
  <el-tree-select
    clearable
    filterable
    :data="data"
    check-strictly
    default-expand-all
    node-key="organizationId"
    :props="{ label: 'organizationName' }"
    :placeholder="placeholder"
    v-model="model"
    class="y-fluid"
    :popper-options="{ strategy: 'fixed' }"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { YMessage, toTree } from 'y-element-ultra';
  import { listOrganizations } from '@/api/system/organization';
  import type { Organization } from '@/api/system/organization/model';

  withDefaults(
    defineProps<{
      /** 提示信息 */
      placeholder?: string;
    }>(),
    {
      placeholder: '请选择所属机构'
    }
  );

  /** 选中的机构 */
  const model = defineModel<number | string>({ type: [Number, String] });

  /** 机构数据 */
  const data = ref<Organization[]>([]);

  /** 获取机构数据 */
  $http(
    listOrganizations(),
    (res) => {
      data.value = toTree({
        data: res.data || [],
        idField: 'organizationId',
        parentIdField: 'parentId'
      });
    },
    (e) => {
      YMessage.error({ message: e.message, plain: true });
    }
  );
</script>
