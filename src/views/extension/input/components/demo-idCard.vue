<template>
  <y-card header="身份证">
    <el-form
      ref="formRef"
      :model="form"
      label-width=""
      style="max-width: 380px"
      @submit.prevent=""
    >
      <el-form-item prop="value">
        <y-input v-model="form.value" inputType="idCard" />
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
