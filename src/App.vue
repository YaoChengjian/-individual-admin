<template>
  <el-config-provider :locale="elLocale">
    <y-config-provider
      :locale="yLocale"
      :table="tableConfig"
      :map-key="mapKey"
      :license="'11'"
    >
      <y-app>
        <router-view />
      </y-app>
    </y-config-provider>
  </el-config-provider>
</template>

<script lang="ts" setup>
  import { useGlobalConfig } from '@/config/use-global-config';
  import { useThemeStore } from '@/store/modules/theme';
  import { useLocale } from '@/i18n/use-locale';
  const mapKey = import.meta.env.VITE_MAP_KEY;

  /** 组件全局配置 */
  const { tableConfig } = useGlobalConfig();

  /** 恢复缓存主题 */
  const themeStore = useThemeStore();
  themeStore.recoverTheme();

  /** 国际化配置 */
  const { elLocale, yLocale } = useLocale();
</script>
