<template>
  <y-card class="create-card">
    <section-title :index="1" title="基本信息" subtitle="填写基本信息" />
    <el-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-width="96px"
      class="create-form"
      @submit.prevent=""
    >
      <el-form-item label="任务标题" prop="taskTitle" required>
        <el-input
          v-model.trim="model.taskTitle"
          maxlength="50"
          show-word-limit
          :disabled="readonly"
          placeholder="请输入任务标题（最多50字）"
        />
      </el-form-item>
      <el-form-item label="任务类型" prop="taskType" required>
        <dict-data
          code="patrol_task_type"
          v-model="model.taskType"
          :disabled="readonly"
          placeholder="请选择任务类型"
        />
      </el-form-item>
      <el-form-item label="优先级" prop="priority" required>
        <y-check-card
          v-model="model.priority"
          :items="priorityItems"
          :arrow="false"
          :bordered="false"
          :disabled="readonly"
          class="priority-check-card"
        >
          <template #item="{ item }">
            <span
              class="priority-tag-label"
              :style="priorityStyle(item?.color)"
            >
              {{ item?.label }}
            </span>
          </template>
        </y-check-card>
      </el-form-item>
      <el-form-item label="任务说明" prop="description" required>
        <el-input
          v-model.trim="model.description"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          resize="none"
          :disabled="readonly"
          placeholder="请输入任务说明（最多200字）"
        />
      </el-form-item>
      <el-form-item label="是否AI识别重点任务">
        <div class="ai-row">
          <el-switch v-model="model.aiFocus" :disabled="readonly" />
          <el-tooltip
            content="开启后任务会标记为 AI 识别重点任务"
            placement="top"
          >
            <el-icon><InfoFilled /></el-icon>
          </el-tooltip>
        </div>
      </el-form-item>
    </el-form>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { InfoFilled } from '@element-plus/icons-vue';
  import type { CheckCardItem } from 'y-element-ultra/es/y-check-card/types';
  import type { DictionaryData } from '@/api/system/dictionary-data/model';
  import type { PatrolTaskCreateState } from '../types';
  import SectionTitle from './section-title.vue';

  const props = defineProps<{
    priorities: DictionaryData[];
    readonly?: boolean;
  }>();

  const readonly = computed(() => props.readonly);

  const model = defineModel<PatrolTaskCreateState>({ required: true });
  const formRef = ref<FormInstance | null>(null);

  const rules = reactive<FormRules>({
    taskTitle: [
      { required: true, message: '请输入任务标题', trigger: 'blur' },
      { max: 50, message: '任务标题不能超过50个字', trigger: 'blur' }
    ],
    taskType: [
      { required: true, message: '请选择任务类型', trigger: 'change' }
    ],
    priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
    description: [
      { required: true, message: '请输入任务说明', trigger: 'blur' },
      { max: 200, message: '任务说明不能超过200字', trigger: 'blur' }
    ]
  });

  const priorityItems = computed<CheckCardItem[]>(() =>
    props.priorities.map((item) => ({
      key: item.dictDataCode,
      value: item.dictDataCode,
      label: item.dictDataName,
      color: item.color
    }))
  );

  const priorityStyle = (color?: string) => {
    if (!color) return {};
    return {
      '--priority-color': color,
      '--priority-bg': `${color}12`,
      '--priority-border': `${color}55`
    };
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
    :deep(.el-textarea) {
      width: 100%;
    }
  }

  .priority-check-card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    gap: 8px;

    :deep(.y-check-card) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 30px;
      overflow: hidden;
      margin: 0;
      padding: 0;
      border: 1px solid var(--priority-border, #dcdfe6);
      border-radius: 6px;
      background: var(--priority-bg, #fff);
      transition:
        color 0.2s,
        border-color 0.2s,
        background-color 0.2s;

      &:not(.is-disabled):not(.is-checked):hover {
        border-color: var(--priority-color, var(--el-color-primary));
      }

      &.is-checked {
        border-color: var(--priority-color, var(--el-color-primary));
        background: var(--priority-color, var(--el-color-primary));
      }
    }

    :deep(.y-check-card-content) {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
  }

  .priority-tag-label {
    display: inline-flex;
    min-width: 58px;
    height: 28px;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 14px;
    color: var(--priority-color, #1f6feb);
    font-size: 13px;
    font-weight: 800;
    line-height: 28px;
    text-align: center;
  }

  :deep(.y-check-card.is-checked) {
    .priority-tag-label {
      color: #fff;
    }
  }

  .ai-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #8b95a5;
  }

  @media (max-width: 640px) {
    .priority-tag-label {
      min-width: 54px;
      padding: 0 12px;
    }
  }
</style>
