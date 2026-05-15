<template>
  <!-- 全屏切换 -->
  <layout-tool class="hidden-sm-and-down" @click="toggleFullscreen">
    <el-icon style="transform: scale(1.18)">
      <CompressOutlined v-if="isFullscreen" style="stroke-width: 4" />
      <ExpandOutlined v-else style="stroke-width: 4" />
    </el-icon>
  </layout-tool>
  <!-- 语言切换 -->
  <layout-tool :class="{ 'hidden-sm-and-down': tabBar && tabInHeader }">
    <i18n-icon :icon-style="{ transform: 'scale(1.15)' }" />
  </layout-tool>
  <!-- 消息通知 -->
  <layout-tool :class="{ 'hidden-sm-and-down': tabBar && tabInHeader }">
    <header-notice />
  </layout-tool>
  <!-- 用户信息 -->
  <layout-tool>
    <header-user />
  </layout-tool>
</template>

<script lang="ts" setup>
  import { storeToRefs } from 'pinia';
  import {
    LayoutTool,
    requestFullscreen,
    exitFullscreen,
    YMessage
  } from 'y-element-ultra';
  import {
    ExpandOutlined,
    CompressOutlined
  } from '@/components/icons';
  import { useThemeStore } from '@/store/modules/theme';
  import HeaderUser from './header-user.vue';
  import HeaderNotice from './header-notice.vue';
  import I18nIcon from './i18n-icon.vue';

  const props = defineProps({
    /** 是否全屏状态 */
    isFullscreen: Boolean
  });

  const emit = defineEmits(['update:isFullscreen']);

  const themeStore = useThemeStore();
  const { tabBar, tabInHeader } = storeToRefs(themeStore);

  /** 全屏切换 */
  const toggleFullscreen = () => {
    if (props.isFullscreen) {
      exitFullscreen();
      emit('update:isFullscreen', false);
      return;
    }
    try {
      requestFullscreen();
      emit('update:isFullscreen', true);
    } catch (e: any) {
      console.error(e);
      YMessage.error({ message: e.message, plain: true });
    }
  };
</script>
