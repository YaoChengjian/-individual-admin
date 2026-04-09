<template>
  <y-page :multi-card="true">
    <y-card header="基础用法">
      <el-form label-width="120px" style="max-width: 380px" @submit.prevent="">
        <el-form-item label="按钮是否防抖">
          <el-select
            v-model="isDebounce"
            clearable
            placeholder="请选择"
            class="y-fluid"
            :popper-options="{ strategy: 'fixed' }"
          >
            <el-option :value="true" label="是" />
            <el-option :value="false" label="否" />
          </el-select>
        </el-form-item>

        <el-form-item label="防抖时间(ms)">
          <y-input v-model="time" inputType="integer" />
        </el-form-item>

        <el-form-item>
          <y-button
            :isDebounce="isDebounce"
            :time="time"
            type="primary"
            @click="exportExcel"
            >导出</y-button
          >
        </el-form-item>
      </el-form>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMessage } from 'y-element-ultra';

  defineOptions({ name: 'ExtensionButton' });

  const messageIns = useMessage({ plain: true });

  /** 按钮是否防抖 */
  const isDebounce = ref(false);
  const time = ref(1000);

  /** methods */
  const exportExcel = () => {
    messageIns.success({ message: '保存成功' });
  };
</script>
