<template>
  <y-page flex-table="auto" hide-footer :multi-card="false">
    <y-card flex-table="auto" :body-style="{ padding: 0 }">
      <pro-form-builder
        v-model="config"
        @previewFormSubmit="handlePreviewFormSubmit"
      />
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { YProFormProps } from 'y-element-ultra/es/y-app/plusx';
  import ProFormBuilder from '@/components/ProFormBuilder/index.vue';

  defineOptions({ name: 'FormBuild' });

  /** 表单配置数据 */
  const config = ref<YProFormProps>({});

  /** 预览表单提交事件 */
  const handlePreviewFormSubmit = (data: Record<string, any>) => {
    console.log(data);
  };
</script>
