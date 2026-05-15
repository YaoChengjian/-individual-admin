<!-- 搜索表单 -->
<template>
  <y-card search-form>
    <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="16">
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="任务标题">
            <el-input
              clearable
              v-model.trim="form.taskTitle"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="任务类型">
            <dict-data
              code="patrol_task_type"
              v-model="form.taskType"
              placeholder="请选择"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="任务状态">
            <dict-data
              code="patrol_task_status"
              v-model="form.taskStatus"
              placeholder="请选择"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="timeRange"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="y-fluid"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="巡查地点">
            <el-input
              clearable
              v-model.trim="form.patrolLocation"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="执行人">
            <el-select
              clearable
              filterable
              v-model="form.executorId"
              placeholder="请选择"
              class="y-fluid"
              :loading="userLoading"
            >
              <el-option
                v-for="item in users"
                :key="item.userId"
                :label="item.nickname || item.username"
                :value="item.userId ?? 0"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="12" :md="8" :sm="24" :xs="24">
          <el-form-item label-width="0px">
            <btn-items
              :wrap="false"
              :items="[
                { preset: 'search', onClick: () => search() },
                { preset: 'reset', onClick: () => reset() }
              ]"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </y-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { YMessage } from 'y-element-ultra';
  import { useFormData } from '@/utils/use-form-data';
  import { listUsers } from '@/api/system/user';
  import type { User } from '@/api/system/user/model';
  import type { PatrolTaskParam } from '@/api/task/model';

  const emit = defineEmits<{
    (e: 'search', where?: PatrolTaskParam): void;
  }>();

  const [form, resetFields] = useFormData<PatrolTaskParam>({
    taskTitle: '',
    taskType: '',
    taskStatus: '',
    timeStart: '',
    timeEnd: '',
    patrolLocation: '',
    executorId: void 0
  });

  const timeRange = ref<string[]>([]);
  const users = ref<User[]>([]);
  const userLoading = ref(false);

  const buildWhere = (): PatrolTaskParam => ({
    ...form,
    timeStart: timeRange.value?.[0],
    timeEnd: timeRange.value?.[1]
  });

  const search = () => {
    emit('search', buildWhere());
  };

  const reset = () => {
    resetFields();
    timeRange.value = [];
    search();
  };

  onMounted(() => {
    userLoading.value = true;
    listUsers({ limit: 500 })
      .then((list) => {
        users.value = list || [];
      })
      .catch((e) => {
        YMessage.error({ message: e.message, plain: true });
      })
      .finally(() => {
        userLoading.value = false;
      });
  });
</script>
