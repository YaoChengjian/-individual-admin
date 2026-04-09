<template>
  <div
    class="y-icon-color-secondary"
    :style="{ width: '68px', margin: '0 auto', fontSize: '12px' }"
  >
    <div :style="{ display: 'flex', alignItems: 'center' }">
      <IconRadio size="md" />
      <div>男</div>
    </div>
    <div :style="{ display: 'flex', alignItems: 'center', marginTop: '2px' }">
      <IconRadio size="md" :checked="true" />
      <div>女</div>
    </div>
    <div :style="{ display: 'flex', alignItems: 'center', marginTop: '2px' }">
      <IconRadio size="md" />
      <div>保密</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { IconRadio } from 'y-element-ultra/es/y-pro-form-builder/components/icons/index';
</script>
