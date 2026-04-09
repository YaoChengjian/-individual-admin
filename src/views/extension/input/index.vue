<template>
  <y-page :multi-card="true">
    <DemoText />
    <DemoAmount />
    <DemoDecimal />
    <DemoPhone />
    <DemoInteger />
    <DemoIdCard />
  </y-page>
</template>

<script lang="ts" setup>
  import DemoText from './components/demo-text.vue';
  import DemoAmount from './components/demo-amount.vue';
  import DemoDecimal from './components/demo-decimal.vue';
  import DemoPhone from './components/demo-phone.vue';
  import DemoInteger from './components/demo-integer.vue';
  import DemoIdCard from './components/demo-idCard.vue';

  defineOptions({ name: 'ExtensionInput' });
</script>
