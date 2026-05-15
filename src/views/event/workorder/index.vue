<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <div class="workorder-page-header">
      <div class="page-heading">
        <h1>事件工单</h1>
        <span>AI 识别隐患、H5 上报、第三方推送与处置闭环</span>
      </div>
      <div class="page-actions">
        <el-button size="large" type="primary" @click="reload()"
          >刷新工单</el-button
        >
        <el-button size="large" @click="exportList">导出列表</el-button>
      </div>
    </div>

    <div class="status-tabs">
      <button
        v-for="item in statusTabs"
        :key="item.value || 'all'"
        type="button"
        :class="{ 'is-active': query.status === item.value }"
        @click="setStatus(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <y-card
      class="workorder-table-card"
      flex-table="auto"
      :body-style="{ paddingTop: '8px' }"
    >
      <template #header>
        <div class="table-header-title">工单列表</div>
      </template>
      <template #extra>
        <el-input
          v-model="query.keywords"
          clearable
          placeholder="搜索工单编号 / 标题 / 位置"
          style="width: 280px"
          @keyup.enter="reload()"
        />
      </template>
      <y-pro-table
        ref="tableRef"
        row-key="workOrderId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        :export-config="{ fileName: '事件工单', datasource: exportSource }"
        cache-key="EventWorkorderTable"
        @row-click="openDetail"
      >
        <template #riskLevel="{ row }">
          <el-tag
            size="small"
            :style="tagStyle(row.riskColor)"
            :disable-transitions="true"
          >
            {{ row.riskLevelName }}
          </el-tag>
        </template>
        <template #status="{ row }">
          <y-dot
            :text="row.statusName"
            :color="row.statusColor"
            :ripple="row.statusRipple"
            size="7px"
            class="status-dot"
          />
        </template>
        <template #pushStatus="{ row }">
          <y-dot
            :text="row.pushStatusName"
            :color="row.pushStatusColor"
            :ripple="row.pushStatusRipple"
            size="7px"
            class="status-dot"
          />
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[
              { title: '查看详情', onClick: () => openDetail(row) },
              {
                title: '一键推送',
                props: { disabled: !canPush(row) },
                onClick: () => doAction(row, 'push')
              },
              {
                title: '生成文书',
                props: { disabled: !canGenerateDocument(row) },
                onClick: () => doAction(row, 'generate-document')
              }
            ]"
          />
        </template>
      </y-pro-table>
    </y-card>

    <y-modal v-model="detailVisible" title="工单闭环详情" width="960px">
      <y-loading :loading="detailLoading">
        <div v-if="current" class="detail-panel">
          <div class="detail-hero">
            <div>
              <span>{{ current.workOrderCode }}</span>
              <h2>{{ current.title }}</h2>
              <p>{{ current.description }}</p>
            </div>
            <y-dot
              :text="current.statusName"
              :color="current.statusColor"
              :ripple="current.statusRipple"
              size="8px"
            />
          </div>

          <div class="detail-metrics">
            <div>
              <span>隐患类型</span>
              <strong>{{ current.eventTypeName || '-' }}</strong>
            </div>
            <div>
              <span>风险等级</span>
              <strong :style="{ color: current.riskColor }">{{
                current.riskLevelName
              }}</strong>
            </div>
            <div>
              <span>推送状态</span>
              <strong :style="{ color: current.pushStatusColor }">{{
                current.pushStatusName
              }}</strong>
            </div>
            <div>
              <span>平台单号</span>
              <strong>{{ current.thirdOrderNo || '待推送' }}</strong>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-section">
              <div class="section-title">工单信息</div>
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item label="上报人">{{
                  current.reporterName
                }}</el-descriptions-item>
                <el-descriptions-item label="上报时间">{{
                  current.reportTime
                }}</el-descriptions-item>
                <el-descriptions-item label="事发位置">{{
                  current.addressDetail || current.locationName
                }}</el-descriptions-item>
                <el-descriptions-item label="处置建议">{{
                  current.suggestion || '-'
                }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="detail-section">
              <div class="section-title">AI 识别与取证</div>
              <div class="evidence-preview">
                <img
                  v-if="evidenceImage"
                  :src="evidenceImage"
                  alt="AI识别取证图片"
                />
                <el-empty v-else description="暂无取证图片" :image-size="80" />
              </div>
              <div v-if="aiDetection" class="ai-meta">
                <span
                  >模型：{{
                    aiDetection.modelName || 'mock-ai-inspection'
                  }}</span
                >
                <span>置信度：{{ aiDetection.confidence }}%</span>
              </div>
            </div>
          </div>

          <div class="detail-grid is-bottom">
            <div class="detail-section">
              <div class="section-title">推送记录</div>
              <div v-if="pushRecords.length" class="record-list">
                <div
                  v-for="item in pushRecords"
                  :key="item.pushRecordId"
                  class="record-item"
                >
                  <div>
                    <strong>{{ item.targetPlatform }}</strong>
                    <span>{{ item.requestId }}</span>
                  </div>
                  <y-dot
                    :text="item.pushStatusName"
                    :color="item.statusColor"
                    :ripple="item.statusRipple"
                    size="7px"
                  />
                </div>
              </div>
              <el-empty v-else description="暂未推送" :image-size="72" />
            </div>

            <div class="detail-section">
              <div class="section-title">流转记录</div>
              <el-timeline class="workorder-timeline">
                <el-timeline-item
                  v-for="item in flowRecords"
                  :key="item.flowId"
                  :timestamp="item.createdAt"
                  color="#1677ff"
                >
                  <div class="timeline-item-title">{{ item.action }}</div>
                  <div class="timeline-item-desc">{{
                    item.remark || item.operatorName
                  }}</div>
                </el-timeline-item>
              </el-timeline>
              <el-empty
                v-if="!flowRecords.length"
                description="暂无流转记录"
                :image-size="72"
              />
            </div>
          </div>
        </div>
        <el-empty v-else description="选择一条工单查看闭环详情" />
      </y-loading>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          :disabled="!current || !canPush(current)"
          type="primary"
          @click="current && doAction(current, 'push')"
        >
          一键推送
        </el-button>
        <el-button
          :disabled="!current || !canGenerateDocument(current)"
          type="primary"
          @click="current && doAction(current, 'generate-document')"
        >
          生成文书
        </el-button>
      </template>
    </y-modal>
  </y-page>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { YMessage } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import {
    getWorkOrderDetail,
    listWorkOrders,
    pageWorkOrders,
    workOrderAction
  } from '@/api/closed-loop';
  import type {
    ClosedLoopParam,
    InspectionEvent,
    PushRecord,
    WorkOrder,
    WorkOrderDetail
  } from '@/api/closed-loop/model';

  defineOptions({ name: 'EventWorkorder' });

  type AiDetection = InspectionEvent & {
    markedImageUrl?: string;
    modelName?: string;
    modelVersion?: string;
  };

  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const query = ref<ClosedLoopParam>({});
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detail = ref<WorkOrderDetail>();

  const statusTabs = [
    { label: '全部', value: '' },
    { label: '已提交', value: 'SUBMITTED' },
    { label: '推送中', value: 'PUSHING' },
    { label: '已推送', value: 'PUSHED' },
    { label: '推送失败', value: 'PUSH_FAILED' },
    { label: '文书已生成', value: 'DOCUMENT_GENERATED' },
    { label: '文书已打印', value: 'DOCUMENT_PRINTED' },
    { label: '已闭环', value: 'CLOSED' }
  ];

  const columns = ref<Columns>([
    { prop: 'workOrderCode', label: '工单编号', minWidth: 170, fixed: 'left' },
    { prop: 'title', label: '事件标题', minWidth: 240 },
    { prop: 'eventTypeName', label: '隐患类型', minWidth: 140 },
    {
      prop: 'riskLevel',
      label: '风险等级',
      width: 110,
      align: 'center',
      slot: 'riskLevel'
    },
    { prop: 'reporterName', label: '上报人', width: 110, align: 'center' },
    { prop: 'reportTime', label: '上报时间', width: 170, align: 'center' },
    { prop: 'addressDetail', label: '事发位置', minWidth: 220 },
    {
      prop: 'status',
      label: '工单状态',
      width: 130,
      align: 'center',
      slot: 'status'
    },
    {
      prop: 'pushStatus',
      label: '推送状态',
      width: 130,
      align: 'center',
      slot: 'pushStatus'
    },
    {
      columnKey: 'action',
      label: '操作',
      minWidth: 230,
      fixed: 'right',
      align: 'center',
      slot: 'action',
      showOverflowTooltip: false
    }
  ]);

  const current = computed(() => detail.value?.workOrder);
  const aiDetection = computed(
    () => detail.value?.aiDetection as AiDetection | undefined
  );
  const pushRecords = computed<PushRecord[]>(
    () => detail.value?.pushRecords || []
  );
  const flowRecords = computed(() => detail.value?.flowRecords || []);
  const evidenceImage = computed(() => {
    const evidence = current.value?.evidenceList?.[0]?.fileUrl;
    return (
      evidence ||
      aiDetection.value?.markedImageUrl ||
      aiDetection.value?.imageUrl ||
      ''
    );
  });

  const datasource: DatasourceFunction = ({ pages, orders }) => {
    return pageWorkOrders({ ...query.value, ...pages, ...orders });
  };

  const exportSource: DatasourceFunction = ({ orders }) => {
    return listWorkOrders({ ...query.value, ...orders });
  };

  const tagStyle = (color?: string) => ({
    color: color || '#1677ff',
    backgroundColor: `${color || '#1677ff'}16`,
    borderColor: `${color || '#1677ff'}38`,
    '--el-tag-bg-color': `${color || '#1677ff'}16`,
    '--el-tag-border-color': `${color || '#1677ff'}38`,
    '--el-tag-text-color': color || '#1677ff'
  });

  const canPush = (row: WorkOrder) => {
    return (
      row.status === 'SUBMITTED' ||
      row.status === 'PUSH_FAILED' ||
      row.pushStatus === 'PUSH_FAILED'
    );
  };

  const canGenerateDocument = (row: WorkOrder) => {
    return (
      row.pushStatus === 'PUSH_SUCCESS' &&
      !['DOCUMENT_GENERATED', 'DOCUMENT_PRINTED', 'CLOSED'].includes(row.status)
    );
  };

  const reload = () => {
    tableRef.value?.reload?.({ where: query.value, page: 1 });
  };

  const setStatus = (status: string) => {
    query.value.status = status || undefined;
    reload();
  };

  const openDetail = (row: WorkOrder) => {
    detailVisible.value = true;
    detailLoading.value = true;
    getWorkOrderDetail(row.workOrderId)
      .then((data) => {
        detail.value = data;
      })
      .catch((e) => YMessage.error({ message: e.message, plain: true }))
      .finally(() => {
        detailLoading.value = false;
      });
  };

  const doAction = (row: WorkOrder, action: string) => {
    workOrderAction({ workOrderId: row.workOrderId, action })
      .then((data) => {
        YMessage.success({
          message: action === 'push' ? '推送成功' : '文书已生成',
          plain: true
        });
        detail.value = detail.value
          ? { ...detail.value, workOrder: data }
          : undefined;
        reload();
        openDetail(data);
      })
      .catch((e) => YMessage.error({ message: e.message, plain: true }));
  };

  const exportList = () => {
    YMessage.info({ message: '请使用表格导出功能导出事件工单', plain: true });
  };
</script>

<style lang="scss" scoped>
  .workorder-page-header,
  .page-heading,
  .page-actions,
  .status-tabs,
  .detail-hero,
  .record-item {
    display: flex;
    align-items: center;
  }

  .workorder-page-header {
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .page-heading {
    min-width: 0;
    align-items: baseline;
    gap: 14px;

    h1 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
    }

    span {
      color: #8b95a5;
      font-size: 13px;
      white-space: nowrap;
    }
  }

  .page-actions {
    gap: 10px;
  }

  .status-tabs {
    gap: 10px;
    margin-bottom: 14px;
    overflow-x: auto;

    button {
      height: 36px;
      padding: 0 14px;
      color: #526071;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid #e7edf6;
      border-radius: 8px;
      background: #fff;
      white-space: nowrap;

      &.is-active {
        color: var(--el-color-primary);
        border-color: rgb(31 111 235 / 36%);
        background: rgb(31 111 235 / 7%);
      }
    }
  }

  .workorder-table-card {
    min-width: 0;
    overflow: hidden;
  }

  .table-header-title,
  .section-title {
    color: #172033;
    font-size: 15px;
    font-weight: 800;
  }

  .status-dot {
    font-weight: 700;
  }

  .detail-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .detail-hero {
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border: 1px solid #e8eef7;
    border-radius: 10px;
    background: linear-gradient(135deg, #f7fbff 0%, #fff 100%);

    span {
      color: var(--el-color-primary);
      font-size: 13px;
      font-weight: 800;
    }

    h2 {
      margin: 4px 0;
      color: #111827;
      font-size: 20px;
      line-height: 28px;
    }

    p {
      max-width: 680px;
      margin: 0;
      color: #667085;
      font-size: 13px;
    }
  }

  .detail-metrics,
  .detail-grid {
    display: grid;
    gap: 12px;
  }

  .detail-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    div {
      padding: 14px;
      border: 1px solid #edf1f7;
      border-radius: 9px;
      background: #fff;
    }

    span,
    strong {
      display: block;
    }

    span {
      color: #8b95a5;
      font-size: 12px;
    }

    strong {
      margin-top: 6px;
      color: #111827;
      font-size: 16px;
    }
  }

  .detail-grid {
    grid-template-columns: minmax(0, 1fr) 360px;

    &.is-bottom {
      grid-template-columns: 360px minmax(0, 1fr);
    }
  }

  .detail-section {
    min-width: 0;
    padding: 14px;
    border: 1px solid #edf1f7;
    border-radius: 10px;
    background: #fff;
  }

  .section-title {
    margin-bottom: 12px;
  }

  .evidence-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 210px;
    overflow: hidden;
    border-radius: 8px;
    background: #f4f7fb;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .ai-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    color: #667085;
    font-size: 12px;
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .record-item {
    justify-content: space-between;
    gap: 10px;
    padding: 10px;
    border: 1px solid #edf1f7;
    border-radius: 8px;
    background: #f8fbff;

    strong,
    span {
      display: block;
    }

    strong {
      color: #172033;
      font-size: 13px;
    }

    span {
      margin-top: 3px;
      color: #8b95a5;
      font-size: 12px;
    }
  }

  .workorder-timeline {
    max-height: 260px;
    overflow-y: auto;
  }

  .timeline-item-title {
    color: #172033;
    font-weight: 700;
  }

  .timeline-item-desc {
    margin-top: 2px;
    color: #8b95a5;
    font-size: 12px;
  }

  @media (max-width: 1280px) {
    .detail-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .detail-grid,
    .detail-grid.is-bottom {
      grid-template-columns: 1fr;
    }
  }
</style>
