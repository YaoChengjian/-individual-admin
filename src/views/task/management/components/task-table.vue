<template>
  <y-card
    class="task-table-card"
    :body-style="{ paddingTop: '8px' }"
    flex-table="auto"
  >
    <y-pro-table
      ref="tableRef"
      row-key="taskId"
      :columns="columns"
      :datasource="datasource"
      :show-overflow-tooltip="true"
      :highlight-current-row="true"
      :export-config="{ fileName: '任务列表', datasource: exportSource }"
      cache-key="TaskManagementTable"
    >
      <template #taskCode="{ row }">
        <el-link type="primary" underline="never">{{ row.taskCode }}</el-link>
      </template>
      <template #taskType="{ row }">
        <el-tag
          size="small"
          class="task-type-tag"
          :style="tagStyle(getDictMeta(props.taskTypeDict, row.taskType).color)"
          :disable-transitions="true"
        >
          {{ taskTypeLabel(row) }}
        </el-tag>
      </template>
      <template #taskStatus="{ row }">
        <y-dot
          :text="row.taskStatusName"
          :color="getDictMeta(props.taskStatusDict, row.taskStatus).color"
          :ripple="!!getDictMeta(props.taskStatusDict, row.taskStatus).ripple"
          size="7px"
          class="task-status-dot"
        />
      </template>
      <template #progress="{ row }">
        <TaskProgress :percentage="row.progress" :status="row.taskStatus" />
      </template>
      <template #exceptionCount="{ row }">
        <span :class="{ 'is-danger-count': row.exceptionCount > 0 }">
          {{ row.exceptionCount }}
        </span>
      </template>
      <template #action="{ row, $index }">
        <span :ref="$index === 0 ? setDispatchRef : void 0">
          <btn-items
            divider
            type="link"
            :items="actionItems(row)"
          />
        </span>
      </template>
    </y-pro-table>

    <y-modal
      v-model="workOrderVisible"
      :title="currentTask?.taskCode || '任务工单'"
      width="920px"
    >
      <div v-if="currentTask" class="printed-work-order-panel">
        <y-pro-table
          ref="workOrderTableRef"
          row-key="workOrderId"
          :columns="workOrderColumns"
          :datasource="workOrderDatasource"
          :show-overflow-tooltip="true"
          :highlight-current-row="true"
          cache-key="TaskManagementPrintedWorkOrderTable"
          class="printed-work-order-table"
        >
          <template #title="{ row }">
            <span class="printed-work-order-title">{{ row.title || '-' }}</span>
          </template>
          <template #description="{ row }">
            <span class="printed-work-order-description">
              {{ row.description || '-' }}
            </span>
          </template>
          <template #imageBase64="{ row }">
            <button
              v-if="getWorkOrderImage(row)"
              type="button"
              class="printed-work-order-image"
              @click.stop="previewWorkOrderImage(row)"
            >
              <img :src="getWorkOrderImage(row)" alt="现场图片" />
            </button>
            <span v-else class="printed-work-order-empty">暂无图片</span>
          </template>
          <template #status>
            <y-dot text="已完成" color="#18a058" size="7px" />
          </template>
        </y-pro-table>
      </div>
      <y-image-viewer
        v-model="imageViewerVisible"
        :url-list="imageViewerList"
        :initial-index="0"
        :infinite="false"
        :hide-on-click-modal="true"
      />
    </y-modal>

    <y-modal
      v-model="reportVisible"
      :title="reportTitle"
      width="920px"
      :body-style="{ padding: '0', background: '#f3f6fb' }"
    >
      <div v-if="reportTask" class="task-report">
        <div class="task-report-body grid grid-cols-[minmax(0,1fr)_300px] gap-2.5 px-5 pb-4 pt-3">
          <section class="task-report-section report-summary">
            <div class="section-title">
              <span></span>
              <h4>报告摘要</h4>
            </div>
            <p>
              本次任务围绕{{
                reportTask.patrolLocation || '指定巡查区域'
              }}开展现场巡查，已完成任务执行、事件核查、工单处置、文书留痕与结果归档。系统根据任务状态、异常事件与处置记录形成闭环报告，可作为后续复盘、统计与监管留痕依据。
            </p>
          </section>

          <section class="task-report-section task-report-basic report-basic-info">
            <div class="report-table-title">一、基本信息</div>
            <div class="report-basic-table">
              <div class="report-table-row">
                <div class="report-table-label">任务编号</div>
                <div class="report-table-value">{{ reportTask.taskCode }}</div>
                <div class="report-table-label">任务来源</div>
                <div class="report-table-value">智能单兵巡查平台</div>
              </div>
              <div class="report-table-row">
                <div class="report-table-label">任务类型</div>
                <div class="report-table-value">{{ taskTypeLabel(reportTask) }}</div>
                <div class="report-table-label">当前状态</div>
                <div class="report-table-value">
                  <el-tag
                    size="small"
                    class="report-status-tag"
                    :style="tagStyle(getDictMeta(props.taskStatusDict, reportTask.taskStatus).color)"
                    :disable-transitions="true"
                  >
                    {{ reportTask.taskStatusName || '已完成' }}
                  </el-tag>
                </div>
              </div>
              <div class="report-table-row">
                <div class="report-table-label">提交时间</div>
                <div class="report-table-value">{{ reportTask.createTime || '-' }}</div>
                <div class="report-table-label">受理渠道</div>
                <div class="report-table-value">移动巡查终端</div>
              </div>
              <div class="report-table-row">
                <div class="report-table-label">巡查地点</div>
                <div class="report-table-value is-span-3">
                  {{ reportTask.patrolLocation || '-' }}
                </div>
              </div>
              <div class="report-table-row">
                <div class="report-table-label">任务标题</div>
                <div class="report-table-value is-span-3">
                  {{ reportTask.taskTitle || '-' }}
                </div>
              </div>
              <div class="report-table-row is-large">
                <div class="report-table-label">任务内容</div>
                <div class="report-table-value is-span-3">
                  {{ reportContent }}
                </div>
              </div>
            </div>
          </section>

          <section class="task-report-section task-report-basic report-result">
            <div class="report-table-title">处置结论</div>
            <div class="report-basic-table report-result-table">
              <div class="report-result-content">
                处置建议：下次巡查需重点关注{{
                  reportTask.patrolLocation || '该区域'
                }}高频隐患点位，复核异常事件整改情况，保持巡查影像、工单处置和现场反馈一致。
              </div>
            </div>
          </section>

          <section class="task-report-section report-flow-section">
            <div class="section-title">
              <span></span>
              <h4>闭环流程</h4>
            </div>
            <div class="report-timeline">
              <div
                v-for="item in reportTimeline"
                :key="item.title"
                class="report-timeline-item"
              >
                <i></i>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
                <em>{{ item.status }}</em>
              </div>
            </div>
          </section>
        </div>

        <div class="task-report-footer">
          <img :src="efficientIcon" alt="高效" />
          <div class="report-service-slogan">
            <div>规范&nbsp;&nbsp;高效&nbsp;&nbsp;便民&nbsp;&nbsp;廉洁</div>
            <p>群众利益无小事&nbsp;&nbsp;真诚服务暖人心</p>
          </div>
        </div>
      </div>
    </y-modal>
  </y-card>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { YMessage } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import type { DictionaryData } from '@/api/system/dictionary-data/model';
  import {
    listPatrolTasks,
    pagePrintedWorkOrders,
    pagePatrolTasks
  } from '@/api/task';
  import type {
    PatrolTask,
    PatrolTaskParam,
    PatrolTaskPrintedWorkOrder
  } from '@/api/task/model';
  import efficientIcon from '@/assets/icons/高效.png';
  import TaskProgress from './task-progress.vue';

  const props = defineProps<{
    taskTypeDict: DictionaryData[];
    taskStatusDict: DictionaryData[];
  }>();

  const emit = defineEmits<{
    (e: 'dispatch-ref', el?: HTMLElement | null): void;
  }>();

  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const queryWhere = ref<PatrolTaskParam>({});
  const router = useRouter();
  const workOrderVisible = ref(false);
  const currentTask = ref<PatrolTask>();
  const workOrderTableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const imageViewerVisible = ref(false);
  const imageViewerList = ref<string[]>([]);
  const reportVisible = ref(false);
  const reportTask = ref<PatrolTask>();

  const columns = ref<Columns>([
    {
      prop: 'taskCode',
      label: '任务编号',
      minWidth: 145,
      slot: 'taskCode'
    },
    {
      prop: 'taskTitle',
      label: '任务标题',
      minWidth: 210
    },
    {
      prop: 'taskType',
      label: '任务类型',
      minWidth: 140,
      align: 'center',
      slot: 'taskType'
    },
    {
      prop: 'patrolLocation',
      label: '巡查地点',
      minWidth: 170
    },
    {
      prop: 'planTime',
      label: '计划时间',
      width: 150,
      align: 'center'
    },
    {
      prop: 'executorName',
      label: '执行人',
      minWidth: 120,
      align: 'center'
    },
    {
      prop: 'taskStatus',
      label: '当前状态',
      width: 110,
      align: 'center',
      slot: 'taskStatus'
    },
    {
      prop: 'progress',
      label: '完成进度',
      width: 150,
      slot: 'progress'
    },
    {
      prop: 'exceptionCount',
      label: '异常事件数',
      minWidth: 130,
      align: 'center',
      slot: 'exceptionCount'
    },
    {
      prop: 'creatorName',
      label: '创建人',
      minWidth: 120,
      align: 'center'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 150,
      align: 'center'
    },
    {
      columnKey: 'action',
      label: '操作',
      minWidth: 250,
      fixed: 'right',
      align: 'center',
      slot: 'action',
      showOverflowTooltip: false,
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  const workOrderColumns = ref<Columns>([
    {
      prop: 'title',
      label: '标题',
      minWidth: 220,
      slot: 'title'
    },
    {
      prop: 'description',
      label: '描述',
      minWidth: 420,
      slot: 'description'
    },
    {
      prop: 'imageBase64',
      label: '图片',
      width: 150,
      align: 'center',
      slot: 'imageBase64',
      showOverflowTooltip: false
    },
    {
      prop: 'status',
      label: '状态',
      width: 110,
      align: 'center',
      slot: 'status',
      showOverflowTooltip: false
    }
  ]);

  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    queryWhere.value = where || {};
    return pagePatrolTasks({
      ...where,
      ...orders,
      ...pages
    });
  };

  const exportSource: DatasourceFunction = ({ where, orders }) => {
    return listPatrolTasks({
      ...where,
      ...orders
    });
  };

  const workOrderDatasource: DatasourceFunction = ({ pages, orders }) => {
    if (!currentTask.value?.taskId) {
      return Promise.resolve({ list: [], count: 0 });
    }
    return pagePrintedWorkOrders({
      taskId: currentTask.value.taskId,
      ...pages,
      ...orders
    });
  };

  const getDictMeta = (
    list: DictionaryData[],
    code: string
  ): Partial<DictionaryData> => {
    return list.find((item) => item.dictDataCode === code) || {};
  };

  const tagStyle = (color?: string) => {
    if (!color) return {};
    return {
      backgroundColor: `${color}18`,
      borderColor: `${color}33`,
      '--el-tag-bg-color': `${color}18`,
      '--el-tag-border-color': `${color}33`,
      '--el-tag-text-color': color,
      color
    };
  };

  const taskTypeLabel = (row: PatrolTask) => {
    return (
      row.taskTypeName ||
      getDictMeta(props.taskTypeDict, row.taskType).dictDataName ||
      row.taskType
    );
  };

  const reload = (where?: PatrolTaskParam, page?: number) => {
    tableRef.value?.reload?.({ where, page });
  };

  const setDispatchRef = (instance: any) => {
    const el = instance?.$el || instance;
    emit('dispatch-ref', el || null);
  };

  const canEdit = (row: PatrolTask) => row.taskStatus === 'waiting';

  const canViewWorkOrders = (row: PatrolTask) =>
    ['running', 'finished'].includes(row.taskStatus);

  const canViewReport = (row: PatrolTask) => row.taskStatus === 'finished';

  const reportTitle = computed(() =>
    reportTask.value ? `${reportTask.value.taskCode} 任务报告` : '任务报告'
  );

  const reportContent = computed(() => {
    const task = reportTask.value;
    if (!task) return '-';
    return `本次巡查任务围绕${task.patrolLocation || '指定区域'}开展，执行人${task.executorName || '-'}已完成现场巡查、异常核查、工单处置和结果归档。异常事件共${task.exceptionCount || 0}件，任务完成进度${task.progress || 100}%。`;
  });

  const reportTimeline = computed(() => {
    const task = reportTask.value;
    return [
      {
        title: '任务创建',
        desc: `时间：${task?.createTime || '-'}`,
        status: '已完成'
      },
      {
        title: '任务执行',
        desc: `时间：${task?.startTime || task?.planTime || '-'}`,
        status: '已完成'
      },
      {
        title: '事件处置',
        desc: `时间：${task?.endTime || task?.planTime || '-'}`,
        status: '已完成'
      }
    ];
  });

  const normalizeImageSrc = (value?: string) => {
    const imageSrc = value?.trim();
    if (!imageSrc) return '';
    if (/^(data:|https?:\/\/|\/)/i.test(imageSrc)) {
      return imageSrc;
    }
    return `data:image/jpeg;base64,${imageSrc}`;
  };

  const getWorkOrderImage = (row: PatrolTaskPrintedWorkOrder) => {
    if (row.imageBase64) {
      return normalizeImageSrc(row.imageBase64);
    }
    const evidence = row.evidenceList?.find((item) => {
      return item.imageBase64 || item.imageUrl || item.base64 || item.fileUrl;
    });
    return normalizeImageSrc(
      evidence?.imageBase64 ||
        evidence?.imageUrl ||
        evidence?.base64 ||
        evidence?.fileUrl
    );
  };

  const previewWorkOrderImage = (row: PatrolTaskPrintedWorkOrder) => {
    const imageSrc = getWorkOrderImage(row);
    if (!imageSrc) return;
    imageViewerList.value = [imageSrc];
    imageViewerVisible.value = true;
  };

  const openPrintedWorkOrders = (row: PatrolTask) => {
    currentTask.value = row;
    workOrderVisible.value = true;
    nextTick(() => {
      workOrderTableRef.value?.reload?.({ page: 1 });
    });
  };

  const openTaskReport = (row: PatrolTask) => {
    reportTask.value = row;
    reportVisible.value = true;
  };

  const actionItems = (row: PatrolTask) => [
    {
      title: '查看详情',
      onClick: () => handleAction('查看详情', row)
    },
    ...(canViewWorkOrders(row)
      ? [
          {
            title: '查看工单',
            onClick: () => handleAction('查看工单', row)
          }
        ]
      : []),
    ...(canViewReport(row)
      ? [
          {
            title: '报告',
            onClick: () => handleAction('报告', row)
          }
        ]
      : []),
    {
      title: '编辑',
      props: { disabled: !canEdit(row) },
      onClick: (e: MouseEvent) => handleAction('编辑', row, e)
    }
  ];

  const handleAction = (label: string, row: PatrolTask, e?: MouseEvent) => {
    if (label === '查看详情') {
      router.push({
        path: '/task/management/detail',
        query: { taskId: row.taskId }
      });
      return;
    }
    if (label === '查看工单') {
      openPrintedWorkOrders(row);
      return;
    }
    if (label === '报告') {
      openTaskReport(row);
      return;
    }
    if (label === '编辑' && !canEdit(row)) {
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    if (label === '编辑') {
      router.push({
        path: '/task/management/edit',
        query: { taskId: row.taskId }
      });
      return;
    }
    YMessage.info({ message: `${label}: ${row.taskCode}`, plain: true });
  };

  const currentWhere = computed(() => queryWhere.value);

  defineExpose({
    reload,
    currentWhere
  });
</script>

<style lang="scss" scoped>
  .task-status-dot {
    font-weight: 700;

    :deep(.y-dot-text) {
      margin-left: 6px;
      color: inherit;
    }
  }

  .is-danger-count {
    color: #f04438;
    font-weight: 700;
  }

  .task-type-tag {
    font-weight: 600;
  }

  .task-table-card {
    min-width: 0;
    overflow: hidden;
  }

  .printed-work-order-panel {
    min-height: 280px;
  }

  .printed-work-order-title,
  .printed-work-order-description {
    color: #1f2937;
    font-size: 13px;
    line-height: 20px;
  }

  .printed-work-order-title {
    font-weight: 700;
  }

  .printed-work-order-image {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 74px;
    height: 48px;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #dbe7f8;
    border-radius: 6px;
    background: #f6f9ff;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.18s ease;
    }

    &:hover img {
      transform: scale(1.06);
    }
  }

  .printed-work-order-empty {
    color: #9ca3af;
    font-size: 12px;
  }

  .task-report {
    overflow: hidden;
    color: #1f2937;
    border: 1px solid #d7e4f5;
    background:
      linear-gradient(180deg, rgba(240, 246, 255, 0.96), rgba(255, 255, 255, 0.98)),
      #fff;
  }

  .task-report-body {
    .report-summary {
      grid-column: 1 / -1;
    }
  }

  .report-basic-info {
    grid-column: 1;
    grid-row: 2;
  }

  .report-flow-section {
    grid-column: 2;
    grid-row: 2;
  }

  .report-result {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .task-report-section {
    padding: 18px;
    border: 1px solid #dfe9f6;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 20px rgb(15 78 166 / 5%);

    h4 {
      margin: 0;
      color: #082b64;
      font-size: 15px;
      font-weight: 800;
    }

    p,
    li {
      color: #4b5563;
      font-size: 14px;
      line-height: 24px;
    }

    p,
    ul {
      margin: 0;
    }

    ul {
      padding-left: 18px;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    span {
      width: 4px;
      height: 15px;
      border-radius: 2px;
      background: #1677ff;
    }
  }

  .task-report-basic {
    padding: 0;
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .report-table-title {
    position: relative;
    display: inline-flex;
    min-width: 262px;
    height: 38px;
    align-items: center;
    padding: 0 44px 0 20px;
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    line-height: 38px;
    background: linear-gradient(135deg, #0a4a9d 0%, #155fb8 100%);

    &::after {
      position: absolute;
      top: 0;
      right: -24px;
      width: 0;
      height: 0;
      border-bottom: 38px solid #155fb8;
      border-right: 24px solid transparent;
      content: '';
    }
  }

  .report-basic-table {
    display: grid;
    margin: 0;
    border: 1px solid #aac3e4;
    border-bottom: 0;
    border-left: 0;
    background: #fff;
  }

  .report-table-row {
    display: grid;
    min-height: 48px;
    grid-template-columns: 142px minmax(0, 1fr) 128px minmax(0, 1fr);
  }

  .report-table-row.is-large {
    min-height: 106px;
  }

  .report-table-label,
  .report-table-value {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 10px 18px;
    border-bottom: 1px solid #aac3e4;
    border-left: 1px solid #aac3e4;
    color: #111827;
    font-size: 15px;
    line-height: 24px;
  }

  .report-table-label {
    justify-content: center;
    background: linear-gradient(180deg, #f1f7ff 0%, #e8f2ff 100%);
    font-weight: 800;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .report-table-value {
    background: rgb(255 255 255 / 86%);
    word-break: break-word;
  }

  .report-table-value.is-span-3 {
    grid-column: span 3;
  }

  .report-timeline {
    position: relative;
    display: grid;
    gap: 12px;
    --timeline-axis: 8px;

    &::before {
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: var(--timeline-axis);
      width: 2px;
      transform: translateX(-50%);
      content: '';
      background: #cfe1f7;
    }
  }

  .report-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: flex-start;

    i {
      position: relative;
      z-index: 1;
      width: 16px;
      height: 16px;
      margin-top: 2px;
      justify-self: center;
      border: 3px solid #dbeafe;
      border-radius: 50%;
      background: #1677ff;
    }

    strong {
      display: block;
      color: #172033;
      font-size: 14px;
      line-height: 20px;
    }

    p {
      margin: 2px 0 0;
      color: #6b7280;
      font-size: 12px;
      line-height: 18px;
    }

    em {
      padding: 2px 8px;
      border-radius: 999px;
      color: #0f8a4b;
      font-size: 12px;
      font-style: normal;
      font-weight: 700;
      line-height: 18px;
      background: #eaf8f0;
    }
  }

  .task-report-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 18px 30px 22px;
    border-top: 1px solid #dfe9f6;
    background: #f8fbff;

    img {
      width: 54px;
      height: 54px;
      object-fit: contain;
    }
  }

  .report-result-table {
    border-left: 1px solid #aac3e4;
  }

  .report-result-content {
    width: 100%;
    box-sizing: border-box;
    min-height: 96px;
    padding: 18px 22px;
    border-bottom: 1px solid #aac3e4;
    color: #111827;
    font-size: 15px;
    line-height: 28px;
    background: rgb(255 255 255 / 88%);
  }

  .report-status-tag {
    font-weight: 700;
  }

  .report-result-danger {
    color: #e5484d;
    font-weight: 800;
  }

  .report-service-slogan {
    color: #0a4a9d;
    text-align: left;

    div {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.1em;
      line-height: 30px;
    }

    p {
      margin: 4px 0 0;
      color: #163b72;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 22px;
    }
  }
</style>
