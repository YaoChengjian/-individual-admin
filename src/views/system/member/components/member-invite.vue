<template>
  <y-modal
    form
    :width="620"
    title="邀请成员"
    :loading="loading"
    v-bind="modalProps"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      @submit.prevent=""
    >
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="邀请账号">
            <el-input clearable v-model.trim="form.inviteUsername" placeholder="可选，已有账号可填写" />
          </el-form-item>
          <el-form-item label="邀请邮箱">
            <el-input clearable v-model.trim="form.inviteEmail" placeholder="请输入邀请邮箱" />
          </el-form-item>
          <el-form-item label="邀请手机">
            <el-input clearable v-model.trim="form.invitePhone" placeholder="请输入邀请手机号" />
          </el-form-item>
          <el-form-item label="成员名称">
            <el-input clearable v-model.trim="form.nickname" placeholder="请输入成员名称" />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="所属机构">
            <organization-select v-model="form.organizationId" />
          </el-form-item>
          <el-form-item label="预分配角色" prop="roleIds">
            <role-select v-model="rolesProxy" />
          </el-form-item>
          <el-form-item label="数据权限" prop="dataScope">
            <el-select v-model="form.dataScope" class="y-fluid" placeholder="请选择数据权限">
              <el-option label="仅本人" value="self" />
              <el-option label="本机构" value="organization" />
              <el-option label="当前租户" value="tenant" />
              <el-option label="全部数据" value="all" />
            </el-select>
          </el-form-item>
          <el-form-item label="过期时间">
            <el-date-picker
              v-model="form.expireTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="默认7天后过期"
              class="y-fluid"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注">
        <el-input type="textarea" :rows="3" v-model="form.comments" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <btn-items
        :items="[
          { preset: 'cancel', onClick: () => closeModal() },
          { preset: 'save', onClick: () => save() }
        ]"
      />
    </template>
  </y-modal>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { YMessage, useModal } from 'y-element-ultra';
  import OrganizationSelect from '@/views/system/organization/components/organization-select.vue';
  import RoleSelect from '@/views/system/user/components/role-select.vue';
  import { inviteMember } from '@/api/system/member';
  import type { MemberInviteForm } from '@/api/system/member/model';

  const emit = defineEmits<{
    (e: 'done'): void;
  }>();

  const { modalProps, closeModal } = useModal();
  const formRef = ref<FormInstance | null>(null);
  const loading = ref(false);

  const form = reactive<MemberInviteForm>({
    inviteUsername: '',
    inviteEmail: '',
    invitePhone: '',
    nickname: '',
    organizationId: void 0,
    roleIds: [],
    dataScope: 'self',
    expireTime: '',
    comments: ''
  });

  const rolesProxy = computed({
    get: () => (form.roleIds || []).map((roleId) => ({ roleId })),
    set: (value: any[]) => {
      form.roleIds = value?.map?.((item) => item.roleId) || [];
    }
  });

  const rules = reactive<FormRules>({
    dataScope: [
      { required: true, message: '请选择数据权限', type: 'string', trigger: 'change' }
    ]
  });

  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      inviteMember(form)
        .then((data) => {
          loading.value = false;
          YMessage.success({
            message: `邀请已创建，邀请码：${data.inviteCode}`,
            plain: true,
            duration: 5000
          });
          emit('done');
          closeModal();
        })
        .catch((e) => {
          loading.value = false;
          YMessage.error({ message: e.message, plain: true });
        });
    });
  };
</script>
