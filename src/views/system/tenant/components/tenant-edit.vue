<!-- 租户编辑弹窗 -->
<template>
  <y-modal
    form
    :width="720"
    :title="isUpdate ? '修改租户' : '添加租户'"
    :loading="loading"
    v-bind="modalProps"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="96px"
      @submit.prevent=""
    >
      <el-row :gutter="16">
        <el-col :sm="12" :xs="24">
          <el-form-item label="租户名称" prop="tenantName">
            <el-input
              clearable
              :maxlength="30"
              v-model.trim="form.tenantName"
              placeholder="请输入租户名称"
            />
          </el-form-item>
          <el-form-item label="租户编码" prop="tenantCode">
            <el-input
              clearable
              :maxlength="30"
              v-model.trim="form.tenantCode"
              placeholder="请输入租户编码"
              :disabled="isUpdate"
            />
          </el-form-item>
          <el-form-item label="隔离级别" prop="isolationLevel">
            <el-select
              v-model="form.isolationLevel"
              placeholder="请选择隔离级别"
              class="y-fluid"
            >
              <el-option label="独立隔离" value="strict" />
              <el-option label="同库隔离" value="logical" />
              <el-option label="平台共享" value="shared" />
            </el-select>
          </el-form-item>
          <el-form-item label="到期时间">
            <el-date-picker
              v-model="form.expireTime"
              value-format="YYYY-MM-DD"
              placeholder="请选择到期时间"
              class="y-fluid"
            />
          </el-form-item>
        </el-col>
        <el-col :sm="12" :xs="24">
          <el-form-item label="联系人">
            <el-input
              clearable
              :maxlength="20"
              v-model.trim="form.contactName"
              placeholder="请输入联系人"
            />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input
              clearable
              :maxlength="20"
              v-model.trim="form.contactPhone"
              placeholder="请输入联系电话"
            />
          </el-form-item>
          <el-form-item label="联系邮箱">
            <el-input
              clearable
              :maxlength="100"
              v-model.trim="form.contactEmail"
              placeholder="请输入联系邮箱"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="0" label="启用" />
              <el-radio :value="1" label="停用" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              type="textarea"
              :rows="4"
              :maxlength="200"
              v-model="form.comments"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
  import { YMessage, emailReg, useModal } from 'y-element-ultra';
  import { useFormData } from '@/utils/use-form-data';
  import { addTenant, updateTenant } from '@/api/system/tenant';
  import type { Tenant } from '@/api/system/tenant/model';

  const props = defineProps<{
    /** 修改回显的数据 */
    data?: Tenant | null;
  }>();

  const emit = defineEmits<{
    (e: 'done'): void;
  }>();

  const { modalProps, closeModal } = useModal();

  /** 是否是修改 */
  const isUpdate = ref(false);

  /** 提交状态 */
  const loading = ref(false);

  /** 表单实例 */
  const formRef = ref<FormInstance | null>(null);

  /** 表单数据 */
  const [form, _resetFields, assignFields] = useFormData<Tenant>({
    tenantId: void 0,
    tenantName: '',
    tenantCode: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    isolationLevel: 'strict',
    status: 0,
    expireTime: '',
    comments: ''
  });

  /** 表单校验 */
  const rules = reactive<FormRules>({
    tenantName: [
      {
        required: true,
        message: '请输入租户名称',
        type: 'string',
        trigger: 'blur'
      }
    ],
    tenantCode: [
      {
        required: true,
        message: '请输入租户编码',
        type: 'string',
        trigger: 'blur'
      }
    ],
    isolationLevel: [
      {
        required: true,
        message: '请选择隔离级别',
        type: 'string',
        trigger: 'change'
      }
    ],
    status: [
      {
        required: true,
        message: '请选择状态',
        type: 'number',
        trigger: 'change'
      }
    ],
    contactEmail: [
      {
        pattern: emailReg,
        message: '邮箱格式不正确',
        type: 'string',
        trigger: 'blur'
      }
    ]
  });

  /** 关闭弹窗 */
  const handleCancel = () => {
    closeModal();
  };

  /** 保存 */
  const handleSave = () => {
    formRef.value?.validate?.((valid) => {
      if (!valid) {
        return;
      }
      loading.value = true;
      const saveOrUpdate = isUpdate.value ? updateTenant : addTenant;
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
