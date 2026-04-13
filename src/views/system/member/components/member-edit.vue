<template>
  <y-modal
    form
    :width="720"
    :title="isUpdate ? '修改成员' : '添加成员'"
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
          <el-form-item label="所属机构">
            <organization-select v-model="form.organizationId" />
          </el-form-item>
          <el-form-item label="成员账号" prop="username">
            <el-input
              clearable
              :maxlength="20"
              v-model="form.username"
              placeholder="请输入成员账号"
              :disabled="isUpdate"
            />
          </el-form-item>
          <div v-if="!isUpdate" class="form-help">
            {{
              reuseExistingAccount
                ? '检测到已有平台账号，保存后会直接加入当前租户，原密码不会变。'
                : '已有账号可直接加入当前租户，无需重复创建账号。'
            }}
          </div>
          <el-form-item label="成员名称" prop="nickname">
            <el-input
              clearable
              :maxlength="20"
              v-model="form.nickname"
              placeholder="请输入成员名称"
            />
          </el-form-item>
          <el-form-item label="性别" prop="sex">
            <dict-data code="sex" v-model="form.sex" placeholder="请选择性别" />
          </el-form-item>
          <el-form-item label="角色" prop="roles">
            <role-select v-model="form.roles" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input clearable :maxlength="100" v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="手机号" prop="phone">
            <el-input clearable :maxlength="11" v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="出生日期">
            <el-date-picker
              v-model="form.birthday"
              value-format="YYYY-MM-DD"
              placeholder="请选择出生日期"
              class="y-fluid"
            />
          </el-form-item>
          <el-form-item v-if="!isUpdate" label="登录密码" prop="password">
            <el-input
              show-password
              type="password"
              :maxlength="20"
              v-model="form.password"
              placeholder="请输入登录密码"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="0" label="正常" />
              <el-radio :value="1" label="冻结" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="成员权限">
            <el-switch
              v-model="adminChecked"
              inline-prompt
              active-text="管理员"
              inactive-text="普通"
            />
          </el-form-item>
          <el-form-item label="数据权限" prop="dataScope">
            <el-select v-model="form.dataScope" placeholder="请选择数据权限" class="y-fluid">
              <el-option label="仅本人" value="self" />
              <el-option label="本机构" value="organization" />
              <el-option label="当前租户" value="tenant" />
              <el-option label="全部数据" value="all" />
            </el-select>
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input
              type="textarea"
              :rows="3"
              :maxlength="200"
              v-model="form.introduction"
              placeholder="请输入个人简介"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <btn-items
        :items="[
          { preset: 'cancel', onClick: () => handleCancel() },
          { preset: 'save', onClick: () => save() }
        ]"
      />
    </template>
  </y-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { YMessage, emailReg, phoneReg, useModal } from 'y-element-ultra';
  import { useFormData } from '@/utils/use-form-data';
  import RoleSelect from '@/views/system/user/components/role-select.vue';
  import OrganizationSelect from '@/views/system/organization/components/organization-select.vue';
  import { addMember, updateMember } from '@/api/system/member';
  import type { Member } from '@/api/system/member/model';
  import { checkExistence } from '@/api/system/user';

  const props = defineProps<{
    data?: Member | null;
    organizationId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'done'): void;
  }>();

  const { modalProps, closeModal } = useModal();
  const isUpdate = ref(false);
  const loading = ref(false);
  const reuseExistingAccount = ref(false);
  const formRef = ref<FormInstance | null>(null);

  const [form, _resetFields, assignFields] = useFormData<Member>({
    userId: void 0,
    username: '',
    nickname: '',
    sex: void 0,
    roles: [],
    email: '',
    phone: '',
    password: '',
    introduction: '',
    birthday: '',
    organizationId: props.organizationId,
    status: 0,
    isAdmin: 0,
    dataScope: 'tenant'
  });

  const adminChecked = computed({
    get: () => form.isAdmin === 1,
    set: (value: boolean) => {
      form.isAdmin = value ? 1 : 0;
    }
  });

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入成员账号', type: 'string', trigger: 'blur' },
      { min: 4, message: '账号长度最少为4位', type: 'string', trigger: 'blur' },
      {
        type: 'string',
        trigger: 'blur',
        validator: (_rule: any, value: string, callback: any) => {
          if (isUpdate.value) {
            reuseExistingAccount.value = false;
            callback();
            return;
          }
          checkExistence('username', value, void 0, true)
            .then(() => {
              reuseExistingAccount.value = false;
              callback(new Error('该账号已是当前租户成员'));
            })
            .catch(() => {
              checkExistence('username', value)
                .then(() => {
                  reuseExistingAccount.value = true;
                  callback();
                })
                .catch(() => {
                  reuseExistingAccount.value = false;
                  callback();
                });
            });
        }
      }
    ],
    nickname: [
      { required: true, message: '请输入成员名称', type: 'string', trigger: 'blur' }
    ],
    sex: [{ required: true, message: '请选择性别', type: 'string', trigger: 'change' }],
    roles: [{ required: true, message: '请选择角色', type: 'array', trigger: 'change' }],
    email: [{ pattern: emailReg, message: '邮箱格式不正确', type: 'string', trigger: 'blur' }],
    password: [
      {
        type: 'string',
        trigger: 'blur',
        validator: (_rule: any, value: string, callback: any) => {
          if (isUpdate.value) {
            callback();
            return;
          }
          if (!value) {
            if (reuseExistingAccount.value) {
              callback();
              return;
            }
            callback(new Error('请输入登录密码'));
            return;
          }
          if (/^[\S]{5,18}$/.test(value)) {
            callback();
            return;
          }
          callback(new Error('密码必须为5-18位非空白字符'));
        }
      }
    ],
    phone: [
      { required: true, message: '请输入手机号', type: 'string', trigger: 'blur' },
      { pattern: phoneReg, message: '手机号格式不正确', type: 'string', trigger: 'blur' }
    ],
    dataScope: [
      { required: true, message: '请选择数据权限', type: 'string', trigger: 'change' }
    ]
  });

  const handleCancel = () => closeModal();

  const save = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? updateMember : addMember;
      saveOrUpdate(form)
        .then((msg) => {
          loading.value = false;
          YMessage.success({ message: msg, plain: true });
          emit('done');
          handleCancel();
        })
        .catch((e) => {
          loading.value = false;
          YMessage.error({ message: e.message, plain: true });
        });
    });
  };

  if (props.data) {
    assignFields(props.data);
    isUpdate.value = true;
  }
</script>

<style lang="scss" scoped>
  .form-help {
    margin: -4px 0 12px 88px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
  }
</style>
