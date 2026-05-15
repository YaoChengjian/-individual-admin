<template>
  <y-page>
    <statistics-card />
    <el-row :gutter="16" class="monitor-main-row">
      <el-col :md="16" :sm="24" :xs="24">
        <map-card />
      </el-col>
      <el-col :md="8" :sm="24" :xs="24" class="monitor-task-col">
        <activities-card title="任务执行动态" task-mode />
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <user-rate />
      </el-col>
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <user-satisfaction />
      </el-col>
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <user-liveness />
      </el-col>
    </el-row>
  </y-page>
</template>

<script lang="ts" setup>
  import StatisticsCard from './components/statistics-card.vue';
  import MapCard from './components/map-card.vue';
  import ActivitiesCard from './components/activities-card.vue';
  import UserRate from './components/user-rate.vue';
  import UserSatisfaction from './components/user-satisfaction.vue';
  import UserLiveness from './components/user-liveness.vue';

  defineOptions({ name: 'DashboardMonitor' });
</script>

<style lang="scss" scoped>
  .monitor-main-row {
    align-items: stretch;
  }

  .monitor-task-col {
    display: flex;

    :deep(.task-activity-card) {
      flex: 1;
    }
  }
</style>
