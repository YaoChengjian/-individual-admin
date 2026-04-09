<!-- 统计卡片 -->
<template>
  <el-row :gutter="16">
    <el-col :md="6" :sm="12" :xs="24">
      <y-card class="monitor-count">
        <el-tag size="large" :disable-transitions="true">
          <el-icon>
            <UserFilled />
          </el-icon>
        </el-tag>
        <y-text size="xxl" class="monitor-count-value">21.2 k</y-text>
        <y-text type="placeholder" class="monitor-count-text">
          总访问人数
        </y-text>
        <y-avatar-group :data="visitUsers" size="small" :max-count="4" />
      </y-card>
    </el-col>
    <el-col :md="6" :sm="12" :xs="24">
      <y-card class="monitor-count">
        <el-tag type="warning" size="large" :disable-transitions="true">
          <el-icon>
            <Opportunity />
          </el-icon>
        </el-tag>
        <y-text size="xxl" class="monitor-count-value">1.6 k</y-text>
        <y-text type="placeholder" class="monitor-count-text">
          点击量(近30天)
        </y-text>
        <y-text
          strong
          type="success"
          :icon="ArrowUpBold"
          class="monitor-count-trend"
        >
          &nbsp;110.5%
        </y-text>
        <y-tooltip content="指标说明" placement="top" :offset="3">
          <y-text
            :icon="QuestionCircleOutlined"
            type="placeholder"
            class="monitor-count-tip"
          />
        </y-tooltip>
      </y-card>
    </el-col>
    <el-col :md="6" :sm="12" :xs="24">
      <y-card class="monitor-count">
        <el-tag type="danger" size="large" :disable-transitions="true">
          <el-icon>
            <Flag />
          </el-icon>
        </el-tag>
        <y-text size="xxl" class="monitor-count-value">826.0</y-text>
        <y-text type="placeholder" class="monitor-count-text">
          到达量(近30天)
        </y-text>
        <y-text
          strong
          type="danger"
          :icon="ArrowDownBold"
          class="monitor-count-trend"
        >
          &nbsp;15.5%
        </y-text>
      </y-card>
    </el-col>
    <el-col :md="6" :sm="12" :xs="24">
      <y-card class="monitor-count">
        <el-tag type="success" size="large" :disable-transitions="true">
          <el-icon>
            <Share />
          </el-icon>
        </el-tag>
        <y-text size="xxl" class="monitor-count-value">28.8 %</y-text>
        <y-text type="placeholder" class="monitor-count-text">
          转化率(近30天)
        </y-text>
        <y-text
          strong
          type="success"
          :icon="ArrowUpBold"
          class="monitor-count-trend"
        >
          &nbsp;65.8%
        </y-text>
        <y-tooltip content="指标说明" placement="top" :offset="3">
          <y-text
            :icon="QuestionCircleOutlined"
            type="placeholder"
            class="monitor-count-tip"
          />
        </y-tooltip>
      </y-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import type { AvatarItem } from 'y-element-ultra/es/y-avatar-group/types';
  import {
    UserFilled,
    Opportunity,
    Flag,
    Share,
    ArrowUpBold,
    ArrowDownBold
  } from '@element-plus/icons-vue';
  import { QuestionCircleOutlined } from '@/components/icons';

  /** 访问人数 */
  const visitUsers = ref<AvatarItem[]>([
    {
      key: 1,
      label: 'SunSmile',
      value:
        'https://cdn.eleadmin.com/20200609/c184eef391ae48dba87e3057e70238fb.jpg'
    },
    {
      key: 2,
      label: '你的名字很好听',
      value:
        'https://cdn.eleadmin.com/20200609/b6a811873e704db49db994053a5019b2.jpg'
    },
    {
      key: 3,
      label: '全村人的希望',
      value:
        'https://cdn.eleadmin.com/20200609/948344a2a77c47a7a7b332fe12ff749a.jpg'
    },
    {
      key: 4,
      label: 'Jasmine',
      value:
        'https://cdn.eleadmin.com/20200609/f6bc05af944a4f738b54128717952107.jpg'
    },
    {
      key: 5,
      label: '酷酷的大叔',
      value:
        'https://cdn.eleadmin.com/20200609/2d98970a51b34b6b859339c96b240dcd.jpg'
    },
    {
      key: 6,
      label: '管理员',
      value: 'https://cdn.eleadmin.com/20200610/avatar.jpg'
    }
  ]);
</script>

<style lang="scss" scoped>
  .monitor-count {
    position: relative;
    text-align: center;

    .el-tag {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 16px;
      line-height: 0;
      padding: 0;
    }

    .monitor-count-value {
      margin-top: 8px;
    }

    .monitor-count-text {
      margin: 4px 0 8px 0;
    }

    .monitor-count-trend {
      line-height: 26px;
    }

    .monitor-count-tip {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 15px;
      cursor: help;
    }
  }
</style>
