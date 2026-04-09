<template>
  <y-page>
    <demo-picker />
    <demo-map />
    <demo-track />
  </y-page>
</template>

<script lang="ts" setup>
  import DemoPicker from './components/demo-picker.vue';
  import DemoMap from './components/demo-map.vue';
  import DemoTrack from './components/demo-track.vue';

  defineOptions({ name: 'ExtensionMap' });
</script>
