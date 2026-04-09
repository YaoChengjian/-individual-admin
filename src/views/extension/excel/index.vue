<template>
  <y-page>
    <excel-export />
    <excel-import />
  </y-page>
</template>

<script lang="ts" setup>
  import ExcelExport from './components/excel-export.vue';
  import ExcelImport from './components/excel-import.vue';

  defineOptions({ name: 'ExtensionExcel' });
</script>
