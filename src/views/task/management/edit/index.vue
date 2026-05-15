<template>
  <y-page hide-footer :multi-card="false">
    <div class="create-page">
      <el-skeleton v-if="loading" animated :rows="8" />
      <div v-else class="create-layout">
        <basic-info
          ref="basicInfoRef"
          class="create-card-basic"
          :model-value="form"
          :priorities="priorityDict"
        />
        <range-points
          ref="rangePointsRef"
          class="create-card-range"
          :model-value="form"
          :areas="context.areas"
          :points="context.points"
        />
        <time-setting
          ref="timeSettingRef"
          class="create-card-time"
          :model-value="form"
        />
        <executor-device
          ref="executorDeviceRef"
          class="create-card-executor"
          :model-value="form"
          :executors="context.executors"
        />
      </div>
    </div>

    <div class="create-footer">
      <div class="create-footer-actions">
        <el-button size="large" @click="cancel">取消</el-button>
        <el-button
          size="large"
          type="primary"
          :loading="submitting"
          @click="submit"
        >
          保存修改
        </el-button>
      </div>
    </div>
  </y-page>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { YMessage } from 'y-element-ultra';
  import { getPatrolTaskDetail, updatePatrolTask } from '@/api/task';
  import { useDictData } from '@/utils/use-dict-data';
  import type { PatrolTaskUpdateForm } from '@/api/task/model';
  import type {
    PatrolTaskCreateState,
    TaskCreateContext
  } from '../create/types';
  import BasicInfo from '../create/components/basic-info.vue';
  import ExecutorDevice from '../create/components/executor-device.vue';
  import RangePoints from '../create/components/range-points.vue';
  import TimeSetting from '../create/components/time-setting.vue';

  defineOptions({ name: 'TaskManagementEdit' });

  const route = useRoute();
  const router = useRouter();
  const [priorityDict] = useDictData(['patrol_task_priority']);

  const loading = ref(false);
  const submitting = ref(false);
  const basicInfoRef = ref<InstanceType<typeof BasicInfo> | null>(null);
  const rangePointsRef = ref<InstanceType<typeof RangePoints> | null>(null);
  const timeSettingRef = ref<InstanceType<typeof TimeSetting> | null>(null);
  const executorDeviceRef = ref<InstanceType<typeof ExecutorDevice> | null>(
    null
  );

  const context = reactive<TaskCreateContext>({
    areas: [],
    points: [],
    executors: []
  });

  const form = reactive<PatrolTaskCreateState>({
    taskTitle: '',
    taskType: '',
    priority: '',
    description: '',
    aiFocus: false,
    areaIds: [],
    pointIds: [],
    startTime: '',
    endTime: '',
    durationHours: '',
    repeatRule: '',
    executorId: undefined
  });

  const selectedExecutor = computed(() =>
    context.executors.find((item) => item.userId === form.executorId)
  );

  const taskId = computed(() => Number(route.query.taskId || 0));

  const fillTask = (task: any) => {
    form.taskTitle = task.taskTitle || '';
    form.taskType = task.taskType || '';
    form.priority = task.priority || '';
    form.description = task.description || '';
    form.aiFocus = !!task.aiFocus;
    form.areaIds = task.areaIds || [];
    form.pointIds = task.pointIds || [];
    form.startTime = task.startTime || task.planTime || '';
    form.endTime = task.endTime || '';
    form.durationHours = task.durationHours || '';
    form.repeatRule = task.repeatRule || '';
    form.executorId = task.executorId;
  };

  const loadDetail = () => {
    if (!taskId.value) {
      YMessage.warning({ message: '缺少巡查任务参数', plain: true });
      router.push('/task/management');
      return;
    }
    loading.value = true;
    getPatrolTaskDetail({ taskId: taskId.value })
      .then((data) => {
        context.areas = data.areas || [];
        context.points = data.points || [];
        context.executors = data.executors || [];
        fillTask(data.task || {});
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
        router.push('/task/management');
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const buildPayload = (): PatrolTaskUpdateForm => ({
    taskId: taskId.value,
    taskTitle: form.taskTitle,
    taskType: form.taskType,
    priority: form.priority,
    description: form.description,
    aiFocus: form.aiFocus,
    areaIds: form.areaIds,
    pointIds: form.pointIds,
    startTime: form.startTime,
    endTime: form.endTime,
    durationHours: Number(form.durationHours),
    repeatRule: form.repeatRule,
    executorId: form.executorId,
    draft: false
  });

  const parseTaskTime = (value?: string) => {
    if (!value) return 0;
    const time = new Date(value.replace(/-/g, '/')).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const validateForm = () => {
    if (!form.taskTitle) return '请输入任务标题';
    if (form.taskTitle.length > 50) return '任务标题不能超过50个字';
    if (!form.taskType) return '请选择任务类型';
    if (!form.priority) return '请选择优先级';
    if (!form.description) return '请输入任务说明';
    if (form.description.length > 200) return '任务说明不能超过200字';
    if (!form.areaIds.length) return '请选择社区';
    if (!form.pointIds.length) return '请选择巡查点位';
    if (!form.startTime) return '请选择任务开始时间';
    if (!form.endTime) return '请选择任务结束时间';
    const start = parseTaskTime(form.startTime);
    const end = parseTaskTime(form.endTime);
    if (!start || !end) return '任务时间格式不正确';
    if (end <= start) return '任务结束时间必须晚于开始时间';
    if (
      !Number.isInteger(Number(form.durationHours)) ||
      Number(form.durationHours) < 1
    ) {
      return '预计时长不能小于1小时';
    }
    const actualHours = (end - start) / (60 * 60 * 1000);
    if (Number(form.durationHours) > actualHours) {
      return '预计时长不能超过开始到结束的时间范围';
    }
    if (!form.repeatRule) return '请选择重复规则';
    if (!form.executorId) return '请选择执行人';
    if (!selectedExecutor.value?.devices?.length) return '执行人暂无绑定设备';
    return '';
  };

  const validateSections = async () => {
    const validators = [
      basicInfoRef.value?.validate,
      rangePointsRef.value?.validate,
      timeSettingRef.value?.validate,
      executorDeviceRef.value?.validate
    ];
    const results = await Promise.all(
      validators.map((validate) =>
        validate ? validate() : Promise.resolve(true)
      )
    );
    return results.every(Boolean);
  };

  const saveTask = async () => {
    const sectionsValid = await validateSections();
    const message = validateForm();
    if (!sectionsValid || message) {
      YMessage.warning({ message: message || '请完善任务信息', plain: true });
      return;
    }
    submitting.value = true;
    updatePatrolTask(buildPayload())
      .then(() => {
        YMessage.success({
          message: '修改成功',
          plain: true
        });
        router.push('/task/management');
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      })
      .finally(() => {
        submitting.value = false;
      });
  };

  const cancel = () => {
    router.push('/task/management');
  };

  const submit = () => {
    saveTask();
  };

  onMounted(() => {
    loadDetail();
  });
</script>

<style lang="scss" scoped>
  .create-page {
    padding-bottom: 86px;
  }

  .create-layout {
    display: grid;
    grid-template-columns: minmax(360px, 0.88fr) minmax(620px, 1.42fr);
    grid-template-areas:
      'basic range'
      'time executor';
    gap: 18px;
    align-items: stretch;
  }

  .create-card-basic {
    grid-area: basic;
  }

  .create-card-range {
    grid-area: range;
  }

  .create-card-time {
    grid-area: time;
  }

  .create-card-executor {
    grid-area: executor;
  }

  :deep(.create-card) {
    height: 100%;
    border-radius: 8px;
  }

  .create-footer {
    position: fixed;
    z-index: 9;
    right: 0;
    bottom: 0;
    left: var(--y-admin-sidebar-width, 220px);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding: 12px 20px;
    border-top: 1px solid #edf1f7;
    background: rgb(255 255 255 / 94%);
    backdrop-filter: blur(10px);

    .el-button {
      min-width: 128px;
    }
  }

  .create-footer-actions {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  @media (max-width: 1500px) {
    .create-layout {
      grid-template-columns: minmax(340px, 0.9fr) minmax(520px, 1.2fr);
    }
  }

  @media (max-width: 1280px) {
    .create-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        'basic'
        'range'
        'time'
        'executor';
    }
  }

  @media (max-width: 768px) {
    .create-footer {
      left: 0;
      padding-right: 12px;
      padding-left: 12px;

      .el-button {
        min-width: 0;
      }
    }

    .create-footer-actions {
      gap: 10px;
    }
  }
</style>
