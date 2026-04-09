<template>
  <y-card header="文本提示">
    <option-item label="使用">
      <y-tooltip content="YAdminPlus" placement="top" :offset="8">
        <el-button>Dark</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        effect="light"
        :offset="8"
      >
        <el-button>Light</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        :offset="8"
        transition="el-zoom-in-left"
        :gpu-acceleration="false"
      >
        <el-button>进入动画</el-button>
      </y-tooltip>
    </option-item>
    <option-item label="边框">
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        :offset="8"
        effect="light"
        :popper-style="{
          '--y-tooltip-light-color': 'var(--el-color-primary)',
          '--y-tooltip-light-arrow-bg': 'var(--y-tooltip-light-bg)',
          '--y-tooltip-light-border': '1.5px solid var(--el-color-primary)',
          '--y-popper-arrow-size': '11px',
          '--y-popper-arrow-offset': '-5.33px'
        }"
      >
        <el-button class="y-btn-icon">信息</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        :offset="8"
        effect="light"
        :popper-style="{
          '--y-tooltip-light-color': 'var(--el-color-danger)',
          '--y-tooltip-light-arrow-bg': 'var(--y-tooltip-light-bg)',
          '--y-tooltip-light-border': '1.5px solid var(--el-color-danger)',
          '--y-popper-arrow-size': '11px',
          '--y-popper-arrow-offset': '-5.33px'
        }"
      >
        <el-button class="y-btn-icon">错误</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        :offset="8"
        effect="light"
        :popper-style="{
          '--y-tooltip-light-color': 'var(--el-color-warning)',
          '--y-tooltip-light-arrow-bg': 'var(--y-tooltip-light-bg)',
          '--y-tooltip-light-border': '1.5px solid var(--el-color-warning)',
          '--y-popper-arrow-size': '11px',
          '--y-popper-arrow-offset': '-5.33px'
        }"
      >
        <el-button class="y-btn-icon">警告</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        :offset="8"
        effect="light"
        :popper-style="{
          '--y-tooltip-light-color': 'var(--el-color-success)',
          '--y-tooltip-light-arrow-bg': 'var(--y-tooltip-light-bg)',
          '--y-tooltip-light-border': '1.5px solid var(--el-color-success)',
          '--y-popper-arrow-size': '11px',
          '--y-popper-arrow-offset': '-5.33px'
        }"
      >
        <el-button class="y-btn-icon">成功</el-button>
      </y-tooltip>
    </option-item>
    <option-item label="主题">
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        effect="danger"
        :offset="8"
      >
        <el-button class="y-btn-icon">错误</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        effect="warning"
        :offset="8"
      >
        <el-button class="y-btn-icon">警告</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        effect="success"
        :offset="8"
      >
        <el-button class="y-btn-icon">成功</el-button>
      </y-tooltip>
      <y-tooltip
        content="YAdminPlus"
        placement="top"
        bg="linear-gradient( 135deg, #43CBFF 10%, #9708CC 100%)"
        arrow-bg="#7556E0"
        :offset="8"
      >
        <el-button class="y-btn-icon">Custom</el-button>
      </y-tooltip>
    </option-item>
  </y-card>
</template>

<script lang="ts" setup>
  import OptionItem from '@/views/extension/avatar/components/option-item.vue';
</script>
