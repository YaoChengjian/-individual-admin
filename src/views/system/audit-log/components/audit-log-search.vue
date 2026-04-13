<template>
  <y-card search-form>
    <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="16">
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="审计类型">
            <el-input clearable v-model.trim="form.auditType" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="操作人">
            <el-input clearable v-model.trim="form.actorName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="风险级别">
            <el-select v-model="form.riskLevel" placeholder="请选择" clearable class="y-fluid">
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="12" :sm="12" :xs="24">
          <el-form-item label="目标类型">
            <el-input clearable v-model.trim="form.targetType" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :lg="8" :md="18" :sm="17" :xs="24">
          <el-form-item label="操作时间">
            <el-date-picker
              unlink-panels
              type="datetimerange"
              v-model="dateRange"
              range-separator="-"
              value-format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              class="y-fluid"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="4" :md="6" :sm="7" :xs="24">
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
  import { ref } from 'vue';
  import { useFormData } from '@/utils/use-form-data';
  import type { AuditLogParam } from '@/api/system/audit-log/model';

  const emit = defineEmits<{
    (e: 'search', where?: AuditLogParam): void;
  }>();

  const [form, resetFields] = useFormData<AuditLogParam>({
    auditType: '',
    actorName: '',
    riskLevel: void 0,
    targetType: ''
  });

  const dateRange = ref<[string, string]>(['', '']);

  const search = () => {
    const [createTimeStart, createTimeEnd] = dateRange.value || [];
    emit('search', { ...form, createTimeStart, createTimeEnd });
  };

  const reset = () => {
    resetFields();
    dateRange.value = ['', ''];
    search();
  };
</script>
