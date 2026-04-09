<template>
  <y-page flex-table="auto" hide-footer :multi-card="false">
    <y-card flex-table="auto" :body-style="{ padding: 0 }">
      <pro-crud-builder v-model="config" />
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { YCrudProps } from 'y-element-ultra/es/y-app/plusx';
  import ProCrudBuilder from '@/components/ProCrudBuilder/index.vue';

  defineOptions({ name: 'ListBuild' });

  const config = ref<YCrudProps>({});
</script>
