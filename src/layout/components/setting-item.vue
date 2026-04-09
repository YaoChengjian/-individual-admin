<!-- 主题设置抽屉 -->
<template>
  <div class="y-setting-item">
    <div class="y-setting-item-title">{{ title }}</div>
    <div class="y-setting-item-control">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps({
    title: String
  });
</script>
