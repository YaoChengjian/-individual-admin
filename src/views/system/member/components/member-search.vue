<template>
  <el-form label-width="72px" @keyup.enter="search" @submit.prevent="">
    <el-row :gutter="16">
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="成员账号">
          <el-input clearable v-model.trim="form.username" placeholder="请输入" />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="成员名称">
          <el-input clearable v-model.trim="form.nickname" placeholder="请输入" />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
        <el-form-item label="性别">
          <dict-data code="sex" v-model="form.sex" placeholder="请选择" />
        </el-form-item>
      </el-col>
      <el-col :lg="6" :md="12" :sm="12" :xs="24">
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
</template>

<script lang="ts" setup>
  import { watch } from 'vue';
  import { useFormData } from '@/utils/use-form-data';
  import type { MemberParam } from '@/api/system/member/model';

  const props = defineProps<{
    organizationId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'search', where?: MemberParam): void;
  }>();

  const [form, resetFields] = useFormData<MemberParam>({
    username: '',
    nickname: '',
    sex: void 0
  });

  const search = () => {
    emit('search', { ...form });
  };

  const reset = () => {
    resetFields();
    search();
  };

  watch(
    () => props.organizationId,
    () => resetFields()
  );
</script>
