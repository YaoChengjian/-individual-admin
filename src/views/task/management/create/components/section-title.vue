<template>
  <div class="section-title">
    <span class="section-index">{{ index }}</span>
    <strong>{{ title }}</strong>
    <small v-if="subtitle">{{ subtitle }}</small>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{
    index: number;
    title: string;
    subtitle?: string;
  }>();
</script>

<style lang="scss" scoped>
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    color: #16223a;

    strong {
      font-size: 18px;
      font-weight: 800;
      line-height: 26px;
    }

    small {
      color: #8b95a5;
      font-size: 13px;
      font-weight: 600;
    }
  }

  .section-index {
    display: inline-flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 15px;
    font-weight: 800;
    border: 2px solid rgb(31 111 235 / 18%);
    border-radius: 999px;
    background: var(--el-color-primary);
    box-shadow: 0 4px 10px rgb(31 111 235 / 20%);
  }
</style>
