<template>
  <YCronPanel v-bind="{ ...emitProps, ...$props }">
    <template v-for="name in Object.keys($slots)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </YCronPanel>
</template>

<script lang="ts" setup>
  import {
    cronPanelProps,
    cronPanelEmits
  } from 'y-element-ultra/es/y-cron-panel/props';
  import { useComponentEvents } from 'y-element-ultra/es/utils/hook';

  defineProps(cronPanelProps);

  const emit = defineEmits(cronPanelEmits);

  const { emitProps } = useComponentEvents(cronPanelEmits, emit);
</script>
