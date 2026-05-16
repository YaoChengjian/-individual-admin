<template>
  <y-card class="create-card">
    <section-title :index="3" title="时间设置" subtitle="设置任务执行时间" />
    <el-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-width="116px"
      class="create-form"
      @submit.prevent=""
    >
      <el-form-item label="任务开始时间" prop="startTime" required>
        <el-date-picker
          v-model="model.startTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="请选择开始时间"
          class="y-fluid"
          :disabled="readonly"
          :disabled-date="disabledStartDate"
          @change="handleStartChange"
        />
      </el-form-item>
      <el-form-item label="任务结束时间" prop="endTime" required>
        <el-date-picker
          v-model="model.endTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="请选择结束时间"
          class="y-fluid"
          :disabled="readonly"
          :disabled-date="disabledEndDate"
          @change="handleEndChange"
        />
      </el-form-item>
      <el-form-item label="预计时长" prop="durationHours" required>
        <el-input
          v-model="model.durationHours"
          :disabled="readonly"
          placeholder="请输入预计时长"
          @blur="normalizeDuration"
        >
          <template #append>小时</template>
        </el-input>
        <div class="duration-tip">时长不能小于1小时</div>
      </el-form-item>
      <el-form-item label="重复规则" prop="repeatRule" required>
        <dict-data
          code="patrol_task_repeat_rule"
          v-model="model.repeatRule"
          :disabled="readonly"
          placeholder="请选择重复规则"
        />
      </el-form-item>
    </el-form>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { YMessage } from 'y-element-ultra';
  import type { PatrolTaskCreateState } from '../types';
  import SectionTitle from './section-title.vue';

  const props = defineProps<{
    readonly?: boolean;
  }>();

  const model = defineModel<PatrolTaskCreateState>({ required: true });
  const readonly = computed(() => props.readonly);
  const formRef = ref<FormInstance | null>(null);

  const toTime = (value?: string | number | Date) => {
    if (!value) return 0;
    const date =
      value instanceof Date
        ? value
        : new Date(String(value).replace(/-/g, '/'));
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const startTime = () => toTime(model.value.startTime);
  const endTime = () => toTime(model.value.endTime);
  const todayStart = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const validateStartTime = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    const start = toTime(value);
    if (!value) {
      callback(new Error('请选择任务开始时间'));
      return;
    }
    if (start < todayStart()) {
      callback(new Error('任务开始时间不能早于今天'));
      return;
    }
    callback();
  };

  const validateEndTime = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    const start = startTime();
    const end = toTime(value);
    if (!value) {
      callback(new Error('请选择任务结束时间'));
      return;
    }
    if (start && end <= start) {
      callback(new Error('任务结束时间必须晚于开始时间'));
      return;
    }
    if (end < todayStart()) {
      callback(new Error('任务结束时间不能早于今天'));
      return;
    }
    callback();
  };

  const validateDuration = (
    _rule: unknown,
    value: string | number,
    callback: (error?: Error) => void
  ) => {
    const duration = Number(value);
    const start = startTime();
    const end = endTime();
    if (!Number.isInteger(duration) || duration < 1) {
      callback(new Error('预计时长不能小于1小时'));
      return;
    }
    if (start && end && duration > (end - start) / (60 * 60 * 1000)) {
      callback(new Error('预计时长不能超过开始到结束的时间范围'));
      return;
    }
    callback();
  };

  const rules = reactive<FormRules>({
    startTime: [
      { required: true, validator: validateStartTime, trigger: 'change' }
    ],
    endTime: [
      { required: true, validator: validateEndTime, trigger: 'change' }
    ],
    durationHours: [
      { required: true, validator: validateDuration, trigger: 'blur' }
    ],
    repeatRule: [
      { required: true, message: '请选择重复规则', trigger: 'change' }
    ]
  });

  const disabledStartDate = (date: Date) => {
    if (date.getTime() < todayStart()) return true;
    const end = endTime();
    return !!end && date.getTime() > end;
  };

  const disabledEndDate = (date: Date) => {
    if (date.getTime() < todayStart()) return true;
    const start = startTime();
    return !!start && date.getTime() < start;
  };

  const handleStartChange = () => {
    const start = startTime();
    const end = endTime();
    if (start && start < todayStart()) {
      model.value.startTime = '';
      YMessage.warning({
        message: '任务开始时间不能早于今天',
        plain: true
      });
      formRef.value?.validateField?.('startTime');
      return;
    }
    if (start && end && start >= end) {
      model.value.endTime = '';
      YMessage.warning({
        message: '任务结束时间必须晚于开始时间',
        plain: true
      });
      formRef.value?.validateField?.('endTime');
    }
  };

  const handleEndChange = () => {
    const start = startTime();
    const end = endTime();
    if (start && end && end <= start) {
      model.value.endTime = '';
      YMessage.warning({
        message: '任务结束时间必须晚于开始时间',
        plain: true
      });
      formRef.value?.validateField?.('endTime');
    }
  };

  const normalizeDuration = () => {
    const value = String(model.value.durationHours || '').replace(/\D/g, '');
    model.value.durationHours = value;
  };

  const validate = () =>
    new Promise<boolean>((resolve) => {
      formRef.value?.validate((valid) => {
        resolve(valid);
      });
    });

  const clearValidate = () => {
    formRef.value?.clearValidate();
  };

  defineExpose({ clearValidate, validate });
</script>

<style lang="scss" scoped>
  .create-form {
    :deep(.el-select),
    :deep(.el-input),
    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  .duration-tip {
    width: 100%;
    margin-top: 6px;
    color: #8b95a5;
    font-size: 12px;
    text-align: right;
  }
</style>
