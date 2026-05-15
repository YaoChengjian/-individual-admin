<template>
  <y-card class="create-card preview-card">
    <h3>任务预览摘要</h3>
    <div class="preview-list">
      <div class="preview-item">
        <el-icon><Document /></el-icon>
        <div>
          <span>任务标题</span>
          <strong>{{ model.taskTitle || '未填写' }}</strong>
        </div>
      </div>
      <div class="preview-item">
        <el-icon><CollectionTag /></el-icon>
        <div>
          <span>任务类型</span>
          <strong>{{ taskTypeName || '未选择' }}</strong>
        </div>
      </div>
      <div class="preview-item">
        <el-icon><Location /></el-icon>
        <div>
          <span>巡查点数量</span>
          <strong>{{ pointCount }} 个</strong>
        </div>
      </div>
      <div class="preview-item">
        <el-icon><Clock /></el-icon>
        <div>
          <span>计划时间</span>
          <strong
            >{{ model.startTime || '未设置' }} 至
            {{ model.endTime || '未设置' }}</strong
          >
        </div>
      </div>
      <div class="preview-item">
        <el-icon><Timer /></el-icon>
        <div>
          <span>预计时长</span>
          <strong>{{ model.durationHours || 0 }}小时</strong>
        </div>
      </div>
      <div class="preview-item">
        <el-icon><User /></el-icon>
        <div>
          <span>执行人</span>
          <strong>{{ executorName || '未选择' }}</strong>
        </div>
      </div>
      <div class="preview-item">
        <el-icon><Monitor /></el-icon>
        <div>
          <span>设备分配</span>
          <strong>{{ deviceNames || '未分配' }}</strong>
        </div>
      </div>
    </div>
    <div class="preview-tip">请检查任务信息，确认无误后下发任务</div>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import {
    Clock,
    CollectionTag,
    Document,
    Location,
    Monitor,
    Timer,
    User
  } from '@element-plus/icons-vue';
  import type { DictionaryData } from '@/api/system/dictionary-data/model';
  import type { TaskCreateContext, PatrolTaskCreateState } from '../types';

  const props = defineProps<{
    context: TaskCreateContext;
    taskTypes: DictionaryData[];
  }>();

  const model = defineModel<PatrolTaskCreateState>({ required: true });

  const pointCount = computed(() => model.value.pointIds.length);

  const taskTypeName = computed(
    () =>
      props.taskTypes.find((item) => item.dictDataCode === model.value.taskType)
        ?.dictDataName
  );

  const executor = computed(() =>
    props.context.executors.find(
      (item) => item.userId === model.value.executorId
    )
  );

  const executorName = computed(
    () => executor.value?.nickname || executor.value?.username || ''
  );

  const deviceNames = computed(() =>
    executor.value?.devices?.map((item) => item.deviceName).join('、')
  );
</script>

<style lang="scss" scoped>
  .preview-card {
    position: sticky;
    top: 16px;

    h3 {
      margin: 0;
      padding-bottom: 18px;
      color: #16223a;
      font-size: 20px;
      font-weight: 800;
      line-height: 28px;
      border-bottom: 1px solid #edf1f7;
    }
  }

  .preview-list {
    display: grid;
    gap: 24px;
    padding-top: 22px;
  }

  .preview-item {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 12px;
    align-items: start;

    .el-icon {
      width: 34px;
      height: 34px;
      color: #1f6feb;
      border-radius: 999px;
      background: #eaf2ff;
    }

    span,
    strong {
      display: block;
    }

    span {
      margin-bottom: 6px;
      color: #8b95a5;
      font-size: 13px;
      font-weight: 600;
    }

    strong {
      color: #1f2937;
      font-size: 16px;
      line-height: 26px;
    }
  }

  .preview-tip {
    margin-top: 28px;
    padding-top: 20px;
    color: #8b95a5;
    font-size: 14px;
    border-top: 1px solid #edf1f7;
  }
</style>
