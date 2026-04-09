<!-- 全局页脚 -->
<template>
  <y-text type="placeholder" class="y-footer">
    <div>{{ t('layout.footer.copyright') }}</div>
  </y-text>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
