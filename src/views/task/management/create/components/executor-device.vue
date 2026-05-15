<template>
  <y-card class="create-card executor-card">
    <section-title
      :index="4"
      title="执行人与设备"
      subtitle="选择执行人并分配设备"
    />
    <el-form
      ref="formRef"
      :model="model"
      :rules="rules"
      class="executor-grid"
      @submit.prevent=""
    >
      <div class="executor-panel">
        <div class="field-label">执行人 <span>*</span></div>
        <el-form-item prop="executorId">
          <el-select
            v-model="model.executorId"
            filterable
            placeholder="请选择巡查员"
            class="y-fluid"
            :disabled="readonly"
          >
            <el-option
              v-for="item in executors"
              :key="item.userId"
              :label="item.nickname || item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>

        <div v-if="selectedExecutor" class="executor-person">
          <div class="executor-person-main">
            <el-avatar :size="38" :src="defaultAvatar" />
            <strong>{{
              selectedExecutor.nickname || selectedExecutor.username
            }}</strong>
          </div>
          <div class="executor-person-meta">
            <span>工号：{{ selectedExecutor.employeeNo }}</span>
            <y-dot text="可执行" color="#20b56b" ripple size="7px" />
          </div>
          <el-button
            v-if="!readonly"
            text
            :icon="Close"
            @click="model.executorId = undefined"
          />
        </div>
      </div>

      <div class="device-panel">
        <div class="field-label">设备分配</div>
        <div class="device-grid">
          <div
            v-for="device in selectedExecutor?.devices || []"
            :key="device.deviceId"
            class="device-item"
          >
            <img
              class="device-icon"
              :src="deviceIcon(device.deviceType)"
              :alt="device.deviceName"
            />
            <div>
              <strong>{{ device.deviceName }}</strong>
              <span>SN: {{ device.deviceSn }}</span>
              <em>{{ device.bindStatus === 'bound' ? '已绑定' : '未绑定' }}</em>
            </div>
          </div>
          <el-empty
            v-if="!selectedExecutor?.devices?.length"
            :image-size="88"
            description="选择巡查员后显示绑定设备"
          />
        </div>
      </div>
    </el-form>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { Close } from '@element-plus/icons-vue';
  import glassesIcon from '@/assets/icons/VR眼镜.png';
  import headsetIcon from '@/assets/icons/耳机.png';
  import badgeIcon from '@/assets/icons/工牌.png';
  import handheldIcon from '@/assets/icons/手机.png';
  import printerIcon from '@/assets/icons/打印机.png';
  import defaultAvatar from '@/assets/avatar.png';
  import type { PatrolExecutor } from '@/api/task/model';
  import type { PatrolTaskCreateState } from '../types';
  import SectionTitle from './section-title.vue';

  const props = defineProps<{
    executors: PatrolExecutor[];
    readonly?: boolean;
  }>();

  const model = defineModel<PatrolTaskCreateState>({ required: true });
  const readonly = computed(() => props.readonly);
  const formRef = ref<FormInstance | null>(null);

  const selectedExecutor = computed(() =>
    props.executors.find((item) => item.userId === model.value.executorId)
  );

  const validateExecutor = (
    _rule: unknown,
    value: number | undefined,
    callback: (error?: Error) => void
  ) => {
    if (!value) {
      callback(new Error('请选择执行人'));
      return;
    }
    const executor = props.executors.find((item) => item.userId === value);
    if (!executor?.devices?.length) {
      callback(new Error('执行人暂无绑定设备'));
      return;
    }
    callback();
  };

  const rules = reactive<FormRules>({
    executorId: [
      { required: true, validator: validateExecutor, trigger: 'change' }
    ]
  });

  const deviceIcon = (type: string) => {
    const map = {
      smart_glasses: glassesIcon,
      headset: headsetIcon,
      badge: badgeIcon,
      handheld: handheldIcon,
      printer: printerIcon
    };
    return map[type as keyof typeof map] || handheldIcon;
  };

  const validate = () =>
    new Promise<boolean>((resolve) => {
      formRef.value?.validate((valid) => {
        resolve(valid);
      });
    });

  defineExpose({ validate });
</script>

<style lang="scss" scoped>
  .executor-grid {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 22px;
  }

  .field-label {
    margin-bottom: 10px;
    color: #1f2937;
    font-size: 14px;
    font-weight: 700;

    span {
      color: #f04438;
    }
  }

  .executor-person {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 28px;
    gap: 10px;
    align-items: center;
    margin-top: 16px;
    padding: 14px;
    border: 1px solid #edf1f7;
    border-radius: 6px;
    background: #fbfdff;
  }

  .executor-person-main {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;

    strong {
      overflow: hidden;
      color: #172033;
      font-size: 15px;
      line-height: 22px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .executor-person-meta {
    grid-column: 1 / 2;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 0;

    span {
      color: #64748b;
      font-size: 12px;
    }

    :deep(.y-dot) {
      color: #20b56b;
      font-weight: 700;
    }
  }

  .device-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .device-item {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    min-height: 74px;
    padding: 12px;
    border: 1px solid #edf1f7;
    border-radius: 6px;
    background: #fff;

    strong,
    span,
    em {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: #172033;
      font-size: 14px;
      font-style: normal;
      line-height: 20px;
    }

    span {
      color: #64748b;
      font-size: 12px;
      line-height: 18px;
    }

    em {
      color: #20b56b;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: 18px;
    }
  }

  .device-icon {
    width: 30px;
    height: 30px;
    object-fit: contain;
  }

  @media (max-width: 1024px) {
    .executor-grid,
    .device-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
