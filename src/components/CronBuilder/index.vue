<!-- Cron 表达式生成器 -->
<template>
  <YCronBuilder v-bind="{ ...emitProps, ...$props }">
    <template v-for="name in Object.keys($slots)" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </YCronBuilder>
</template>

<script lang="ts" setup>
  import {
    cronBuilderProps,
    cronBuilderEmits
  } from 'y-element-ultra/es/y-cron-builder/props';
  import { useComponentEvents } from 'y-element-ultra/es/utils/hook';

  defineOptions({ name: 'CronBuilder' });

  defineProps(cronBuilderProps);

  const emit = defineEmits(cronBuilderEmits);

  const { emitProps } = useComponentEvents(cronBuilderEmits, emit);
</script>
