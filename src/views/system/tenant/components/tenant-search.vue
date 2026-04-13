<!-- 搜索表单 -->
<template>
  <y-card search-form>
    <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
      <el-row :gutter="16">
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="租户名称">
            <el-input
              clearable
              v-model.trim="form.tenantName"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="租户编码">
            <el-input
              clearable
              v-model.trim="form.tenantCode"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="隔离级别">
            <el-select
              clearable
              v-model="form.isolationLevel"
              placeholder="请选择"
              class="y-fluid"
            >
              <el-option label="独立隔离" value="strict" />
              <el-option label="同库隔离" value="logical" />
              <el-option label="平台共享" value="shared" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="6" :md="8" :sm="12" :xs="24">
          <el-form-item label="状态">
            <el-select
              clearable
              v-model="form.status"
              placeholder="请选择"
              class="y-fluid"
            >
              <el-option label="启用" :value="0" />
              <el-option label="停用" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="24" :md="24" :sm="24" :xs="24">
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
  import { useFormData } from '@/utils/use-form-data';
  import type { TenantParam } from '@/api/system/tenant/model';

  const emit = defineEmits<{
    (e: 'search', where?: TenantParam): void;
  }>();

  /** 表单数据 */
  const [form, resetFields] = useFormData<TenantParam>({
    tenantName: '',
    tenantCode: '',
    isolationLevel: void 0,
    status: void 0
  });

  /** 搜索 */
  const search = () => {
    emit('search', { ...form });
  };

  /** 重置 */
  const reset = () => {
    resetFields();
    search();
  };
</script>
