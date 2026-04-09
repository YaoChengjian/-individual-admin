<template>
  <div>
    <y-card style="border-radius: 0">
      <y-text type="heading" size="lg">添加用户</y-text>
      <y-text type="placeholder" style="margin-top: 6px">
        填写用户基本信息后点击保存按钮
      </y-text>
    </y-card>
    <y-page>
      <y-card>
        <edit-form />
      </y-card>
    </y-page>
  </div>
</template>

<script lang="ts" setup>
  import EditForm from '../components/edit-form.vue';

  defineOptions({ name: 'ListBasicAdd' });
</script>
