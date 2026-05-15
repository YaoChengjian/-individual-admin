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
      minWidth: 220,
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

  const canViewWorkOrders = (row: PatrolTask) => row.taskStatus === 'running';

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
</style>
