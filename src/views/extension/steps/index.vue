<template>
  <y-page>
    <y-card header="基础用法">
      <y-steps
        :active="active"
        finish-status="success"
        :items="[
          { title: '第一步', description: '填写转账信息' },
          { title: '第二步', description: '确认转账信息' },
          { title: '第三步', description: '转账成功' }
        ]"
        :align-center="!!alignCenter"
      />
      <div style="margin-top: 28px; display: flex; align-items: center">
        <el-button @click="handlePrev">上一步</el-button>
        <el-button type="primary" @click="handleNext">下一步</el-button>
        <div style="margin-left: 12px">
          <el-checkbox
            v-model="alignCenter"
            :true-value="1"
            :false-value="0"
            label="居中"
          />
        </div>
      </div>
    </y-card>
    <y-card header="紧凑版">
      <y-steps
        :active="active"
        finish-status="success"
        type="inline"
        :items="[
          { title: '第一步', description: '填写转账信息' },
          { title: '第二步', description: '确认转账信息' },
          { title: '第三步', description: '转账成功' }
        ]"
      />
    </y-card>
    <y-card header="竖直方向">
      <div style="height: 320px">
        <y-steps
          :active="active"
          finish-status="success"
          direction="vertical"
          :items="[
            { title: '第一步', description: '填写转账信息' },
            { title: '第二步', description: '确认转账信息' },
            { title: '第三步', description: '转账成功' }
          ]"
        />
      </div>
    </y-card>
    <y-card header="自定义图标">
      <div style="margin-bottom: 40px">
        <el-button @click="handlePrev">上一步</el-button>
        <el-button type="primary" @click="handleNext">下一步</el-button>
      </div>
      <y-steps
        :active="active"
        type="inline"
        :items="[
          { title: '账号注册', icon: markRaw(UserFilled) },
          { title: '邮箱验证', icon: markRaw(Checked) },
          { title: '注册完成', icon: markRaw(SuccessFilled) }
        ]"
        :style="{
          '--y-step-icon-size': '24px',
          '--y-step-line-height': '24px'
        }"
      />
      <y-steps
        :active="active"
        :align-center="true"
        :items="[
          { title: '账号注册', icon: markRaw(UserFilled) },
          { title: '邮箱验证', icon: markRaw(Checked) },
          { title: '注册完成', icon: markRaw(SuccessFilled) }
        ]"
        :style="{
          '--y-step-icon-size': '24px',
          '--y-step-line-height': '24px',
          margin: '68px 0 18px 0'
        }"
      />
    </y-card>
    <y-card header="时间线(自动S形换行)">
      <y-timeline :data="timelineData" style="margin-top: 28px" />
    </y-card>
    <y-card header="自定义内容">
      <y-timeline :data="timelineData2" style="margin-top: 28px">
        <template #itemDescription="{ item }">
          <div v-if="item.time">{{ item.time }}</div>
          <div>科室：{{ item.department }}</div>
          <div>执行人：{{ item.executor }}</div>
        </template>
      </y-timeline>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref, markRaw } from 'vue';
  import { UserFilled, Checked, SuccessFilled } from '@element-plus/icons-vue';
  import type { TimelineItem } from 'y-element-ultra/es/y-timeline/types';

  defineOptions({ name: 'ExtensionSteps' });

  /** 选中步骤 */
  const active = ref(0);

  /** 居中 */
  const alignCenter = ref(0);

  /** 上一步 */
  const handlePrev = () => {
    if (active.value < 1) {
      active.value = 3;
      return;
    }
    active.value = active.value - 1;
  };

  /** 下一步 */
  const handleNext = () => {
    if (active.value > 2) {
      active.value = 0;
      return;
    }
    active.value = active.value + 1;
  };

  /** 数据 */
  const timelineData = ref<TimelineItem[]>([
    {
      key: 1,
      type: 'primary',
      title: '1 签署输血同意书'
    },
    {
      key: 2,
      type: 'primary',
      title: '2 申请单打印'
    },
    {
      key: 3,
      type: 'primary',
      title: '3 医嘱复核'
    },
    {
      key: 4,
      type: 'primary',
      title: '4 申请单送达'
    },
    {
      key: 5,
      type: 'primary',
      title: '5 输血科核收'
    },
    {
      key: 6,
      type: 'primary',
      title: '6 交叉配血'
    },
    {
      key: 7,
      title: '7 取血通知'
    },
    {
      key: 8,
      title: '8 输血医嘱开立'
    },
    {
      key: 9,
      title: '9 打印取血单'
    },
    {
      key: 10,
      title: '10 血袋出库'
    },
    {
      key: 11,
      title: '11 血袋接收'
    },
    {
      key: 12,
      title: '12 输血单核对'
    },
    {
      key: 13,
      title: '13 输血开始'
    }
  ]);

  /** 数据 */
  const timelineData2 = ref<TimelineItem[]>([
    {
      key: 1,
      type: 'primary',
      title: '1 签署输血同意书',
      time: '2024-06-18 14:57:00',
      department: '输血科',
      executor: '徐蕊'
    },
    {
      key: 2,
      type: 'primary',
      title: '2 申请单打印',
      time: '2024-06-18 14:58:00',
      department: '输血科',
      executor: '郭春梅'
    },
    {
      key: 3,
      type: 'primary',
      title: '3 医嘱复核',
      time: '2024-06-18 14:59:00',
      department: '肿瘤科',
      executor: '陆慧玲'
    },
    {
      key: 4,
      type: 'primary',
      title: '4 申请单送达',
      time: '2024-06-18 15:00:00',
      department: '肿瘤科',
      executor: '陆慧玲'
    },
    {
      key: 5,
      type: 'primary',
      title: '5 输血科核收',
      time: '2024-06-18 15:01:00',
      department: '南西9病区',
      executor: '陆慧玲'
    },
    {
      key: 6,
      type: 'danger',
      title: '6 交叉配血',
      time: '2024-06-18 15:02:00',
      department: '输血科',
      executor: '田永立'
    },
    {
      key: 7,
      title: '7 取血通知',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 8,
      title: '8 输血医嘱开立',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 9,
      title: '9 打印取血单',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 10,
      title: '10 血袋出库',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 11,
      title: '11 血袋接收',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 12,
      title: '12 输血单核对',
      time: '',
      department: '',
      executor: ''
    },
    {
      key: 13,
      title: '13 输血开始',
      time: '',
      department: '',
      executor: ''
    }
  ]);
</script>
