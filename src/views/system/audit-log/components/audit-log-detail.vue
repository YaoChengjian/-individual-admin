<template>
  <el-descriptions
    v-if="data"
    :border="true"
    :column="mobile ? 1 : 2"
    class="detail-table"
  >
    <el-descriptions-item label="操作人">
      <div>{{ data.actorName || '-' }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="IP地址">
      <div>{{ data.ip || '-' }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="审计类型">
      <div>{{ data.auditType }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="风险级别">
      <el-tag
        size="small"
        :type="riskTagType[data.riskLevel || 'low'] || 'info'"
        :disable-transitions="true"
      >
        {{ riskLabel[data.riskLevel || 'low'] || data.riskLevel }}
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="目标类型">
      <div>{{ data.targetType || '-' }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="目标ID">
      <div>{{ data.targetId || '-' }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="操作时间" :span="2">
      <div>{{ data.createTime }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="摘要" :span="2">
      <div style="word-break: break-all">{{ data.summary }}</div>
    </el-descriptions-item>
    <el-descriptions-item label="变更前" :span="2">
      <y-ellipsis :max-line="4" :tooltip="ellipsisTooltipProps">
        {{ data.beforeJson || '-' }}
      </y-ellipsis>
    </el-descriptions-item>
    <el-descriptions-item label="变更后" :span="2">
      <y-ellipsis :max-line="4" :tooltip="ellipsisTooltipProps">
        {{ data.afterJson || '-' }}
      </y-ellipsis>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import type { YTooltipProps } from 'y-element-ultra/es/y-app/plus';
  import type { AuditLog } from '@/api/system/audit-log/model';
  import { useMobile } from '@/utils/use-mobile';

  defineProps<{
    data: AuditLog;
  }>();

  const riskLabel: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  };

  const riskTagType: Record<string, 'info' | 'warning' | 'danger'> = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  };

  const ellipsisTooltipProps = reactive<YTooltipProps>({
    popperStyle: {
      width: '580px',
      maxWidth: '90%',
      wordBreak: 'break-all'
    },
    bodyStyle: {
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: '252px',
      overflowY: 'auto',
      '--y-scrollbar-color': '#5e5e5e',
      '--y-scrollbar-hover-color': '#707070',
      '--y-scrollbar-size': '8px'
    },
    offset: 4,
    placement: 'top'
  });

  const { mobile } = useMobile();
</script>

<style lang="scss" scoped>
  .detail-table :deep(td.el-descriptions__label.el-descriptions__cell) {
    width: 88px;
    text-align: right;
    font-weight: normal;
  }

  .detail-table :deep(.el-descriptions__content > div) {
    max-height: 100%;
  }
</style>
