<!-- 全局页脚 -->
<template>
  <y-text type="placeholder" class="y-footer">
    <el-space :size="24">
      <el-link underline="never" href="#" target="_blank">
        {{ t('layout.footer.website') }}
      </el-link>
      <el-link underline="never" href="#" target="_blank">
        {{ t('layout.footer.document') }}
      </el-link>
      <el-link underline="never" href="#" target="_blank">
        {{ t('layout.footer.authorization') }}
      </el-link>
    </el-space>
    <div>{{ t('layout.footer.copyright') }}</div>
  </y-text>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>
