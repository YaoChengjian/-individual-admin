<!-- 角色编辑弹窗 -->
<template>
  <y-modal
    form
    :width="460"
    :title="isUpdate ? '修改角色' : '添加角色'"
    :loading="loading"
    v-bind="modalProps"
    >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent=""
    >
      <el-form-item label="作用域" prop="scopeType">
        <el-select
          v-model="form.scopeType"
          placeholder="请选择作用域"
          class="y-fluid"
        >
          <el-option label="租户角色" value="tenant" />
          <el-option label="平台角色" value="platform" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          clearable
          :maxlength="20"
          v-model="form.roleName"
          placeholder="请输入角色名称"
        />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleCode">
        <el-input
          clearable
          :maxlength="20"
          v-model="form.roleCode"
          placeholder="请输入角色标识"
        />
      </el-form-item>
      <el-form-item label="数据权限" prop="dataScope">
        <el-select
          v-model="form.dataScope"
          placeholder="请选择数据权限"
          class="y-fluid"
        >
          <el-option label="仅本人" value="self" />
          <el-option label="本机构" value="organization" />
          <el-option label="当前租户" value="tenant" />
          <el-option label="全部数据" value="all" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          :rows="4"
          type="textarea"
          v-model="form.comments"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <btn-items
        :items="[
          { preset: 'cancel', onClick: () => handleCancel() },
          { preset: 'save', onClick: () => handleSave() }
        ]"
      />
    </template>
  </y-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import type { FormInstance, FormRules } from 'element-plus';
  import { YMessage, useModal } from 'y-element-ultra';
  import { useFormData } from '@/utils/use-form-data';
  import { addRole, updateRole } from '@/api/system/role';
  import type { Role } from '@/api/system/role/model';

  const props = defineProps<{
    /** 修改回显的数据 */
    data?: Role | null;
  }>();

  const emit = defineEmits<{
    (e: 'done'): void;
  }>();

  const { modalProps, closeModal } = useModal();

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单组件 */
  const formRef = ref<FormInstance | null>(null);

  /** 表单数据 */
  const [form, _resetFields, assignFields] = useFormData<Role>({
    roleId: void 0,
    scopeType: 'tenant',
    roleName: '',
    roleCode: '',
    dataScope: 'tenant',
    comments: ''
  });

  /** 表单验证规则 */
  const rules = reactive<FormRules>({
    scopeType: [
      {
        required: true,
        message: '请选择作用域',
        type: 'string',
        trigger: 'change'
      }
    ],
    roleName: [
      {
        required: true,
        message: '请输入角色名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    roleCode: [
      {
        required: true,
        message: '请输入角色标识',
        type: 'string',
        trigger: 'blur'
      }
    ],
    dataScope: [
      {
        required: true,
        message: '请选择数据权限',
        type: 'string',
        trigger: 'change'
      }
    ]
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    closeModal();
  };

  /** 保存编辑 */
  const handleSave = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? updateRole : addRole;
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

  /** 修改赋值 */
  if (props.data) {
    assignFields(props.data);
    isUpdate.value = true;
  }
</script>
