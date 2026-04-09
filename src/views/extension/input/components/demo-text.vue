<template>
  <y-card header="基础用法">
    <el-form
      ref="formRef"
      :model="form"
      style="max-width: 380px"
      @submit.prevent=""
    >
      <el-form-item prop="value">
        <y-input v-model="form.value" />
      </el-form-item>
    </el-form>
  </y-card>
</template>

<script lang="ts" setup>
  import { useFormData } from '@/utils/use-form-data';

  /** 表单数据 */
  const [form, _resetFields] = useFormData({
    value: ''
  });
</script>
