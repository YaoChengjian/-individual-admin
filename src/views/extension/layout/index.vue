<template>
  <y-page>
    <demo-basic />
    <demo-side />
    <demo-menu />
    <demo-top />
  </y-page>
</template>

<script lang="ts" setup>
  import DemoBasic from './components/demo-basic.vue';
  import DemoSide from './components/demo-side.vue';
  import DemoMenu from './components/demo-menu.vue';
  import DemoTop from './components/demo-top.vue';

  defineOptions({ name: 'ExtensionLayout' });
</script>
