<template>
  <y-page hide-footer :multi-card="false" flex-table="auto">
    <div class="document-page-header">
      <div class="page-heading">
        <h1>文书中心</h1>
        <span>整改通知书生成、预览、模拟打印与归档追踪</span>
      </div>
      <div class="page-actions">
        <el-button size="large" type="primary" @click="reload()"
          >刷新文书</el-button
        >
      </div>
    </div>

    <y-card
      class="document-card"
      flex-table="auto"
      :body-style="{ paddingTop: '8px' }"
    >
      <template #header>
        <div class="table-title">文书列表</div>
      </template>
      <template #extra>
        <el-input
          v-model="query.keywords"
          clearable
          placeholder="搜索文书编号 / 标题 / 单位"
          style="width: 280px"
          @keyup.enter="reload()"
        />
      </template>
      <y-pro-table
        ref="tableRef"
        row-key="documentId"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        cache-key="DocumentCenterTable"
        @row-click="openPreview"
      >
        <template #status="{ row }">
          <y-dot
            :text="row.statusName || row.printStatusName"
            :color="row.statusColor"
            :ripple="row.statusRipple"
            size="7px"
            class="status-dot"
          />
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[
              { title: '预览', onClick: () => openPreview(row) },
              {
                title: '模拟打印',
                props: {
                  disabled:
                    row.status === 'PRINTED' || row.printStatus === 'PRINTED'
                },
                onClick: () => printDocument(row)
              }
            ]"
          />
        </template>
      </y-pro-table>
    </y-card>

    <y-modal v-model="previewVisible" title="文书预览" width="820px">
      <y-loading :loading="previewLoading">
        <div v-if="current" class="document-preview">
          <div class="preview-head">
            <div>
              <span>{{ current.documentCode }}</span>
              <h2>{{ current.documentTitle }}</h2>
            </div>
            <y-dot
              :text="current.statusName || current.printStatusName"
              :color="current.statusColor"
              :ripple="current.statusRipple"
              size="8px"
            />
          </div>
          <div class="doc-body">
            <h3>{{ current.documentTypeName || current.documentTitle }}</h3>
            <p>
              经巡查发现，{{ current.targetName || current.checkedUnit }} 在
              {{ current.checkLocation }} 存在如下问题：
            </p>
            <div class="doc-section">
              <strong>违法事实</strong>
              <p>{{ current.illegalFact || current.content || '-' }}</p>
            </div>
            <div class="doc-section">
              <strong>法律依据</strong>
              <p>{{ current.legalBasis || '-' }}</p>
            </div>
            <div class="doc-section">
              <strong>整改要求</strong>
              <p>{{ current.rectificationRequirement || '-' }}</p>
            </div>
            <div class="doc-meta">
              <span>整改期限：{{ current.deadline || '-' }}</span>
              <span>复查要求：{{ current.reviewRequirement || '-' }}</span>
              <span
                >巡查员：{{
                  current.patrolUserName || current.inspectorName
                }}</span
              >
            </div>
          </div>
        </div>
        <el-empty v-else description="请选择文书" />
      </y-loading>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :disabled="
            !current ||
            current.status === 'PRINTED' ||
            current.printStatus === 'PRINTED'
          "
          @click="current && printDocument(current)"
        >
          模拟打印
        </el-button>
      </template>
    </y-modal>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { YMessage } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type {
    Columns,
    DatasourceFunction
  } from 'y-element-ultra/es/y-pro-table/types';
  import {
    getLawDocumentDetail,
    mockPrintLawDocument,
    pageLawDocuments
  } from '@/api/closed-loop';
  import type { ClosedLoopParam, LawDocument } from '@/api/closed-loop/model';

  defineOptions({ name: 'DocumentCenter' });

  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);
  const query = ref<ClosedLoopParam>({});
  const current = ref<LawDocument>();
  const previewVisible = ref(false);
  const previewLoading = ref(false);

  const columns = ref<Columns>([
    { prop: 'documentCode', label: '文书编号', minWidth: 180, fixed: 'left' },
    { prop: 'documentTitle', label: '文书标题', minWidth: 220 },
    { prop: 'documentTypeName', label: '文书类型', minWidth: 160 },
    { prop: 'targetName', label: '检查对象', minWidth: 160 },
    { prop: 'checkLocation', label: '检查地点', minWidth: 220 },
    {
      prop: 'status',
      label: '文书状态',
      width: 130,
      align: 'center',
      slot: 'status'
    },
    { prop: 'patrolUserName', label: '巡查员', width: 110, align: 'center' },
    { prop: 'generatedAt', label: '生成时间', width: 170, align: 'center' },
    { prop: 'printedAt', label: '打印时间', width: 170, align: 'center' },
    {
      columnKey: 'action',
      label: '操作',
      minWidth: 150,
      fixed: 'right',
      align: 'center',
      slot: 'action',
      showOverflowTooltip: false
    }
  ]);

  const datasource: DatasourceFunction = ({ pages, orders }) => {
    return pageLawDocuments({ ...query.value, ...pages, ...orders });
  };

  const reload = () => {
    tableRef.value?.reload?.({ where: query.value, page: 1 });
  };

  const openPreview = (row: LawDocument) => {
    previewVisible.value = true;
    previewLoading.value = true;
    getLawDocumentDetail(row.documentId)
      .then((data) => {
        current.value = data;
      })
      .catch((e) => YMessage.error({ message: e.message, plain: true }))
      .finally(() => {
        previewLoading.value = false;
      });
  };

  const printDocument = (row: LawDocument) => {
    mockPrintLawDocument(row.documentId)
      .then((data) => {
        current.value = data;
        YMessage.success({ message: '模拟打印完成', plain: true });
        reload();
      })
      .catch((e) => YMessage.error({ message: e.message, plain: true }));
  };
</script>

<style lang="scss" scoped>
  .document-page-header,
  .page-heading,
  .page-actions,
  .preview-head,
  .doc-meta {
    display: flex;
    align-items: center;
  }

  .document-page-header {
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

  .document-card {
    min-width: 0;
    overflow: hidden;
  }

  .table-title {
    color: #172033;
    font-size: 15px;
    font-weight: 800;
  }

  .status-dot {
    font-weight: 700;
  }

  .document-preview {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .preview-head {
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border: 1px solid #e8eef7;
    border-radius: 10px;
    background: #f8fbff;

    span {
      color: var(--el-color-primary);
      font-size: 13px;
      font-weight: 800;
    }

    h2 {
      margin: 4px 0 0;
      color: #111827;
      font-size: 20px;
      line-height: 28px;
    }
  }

  .doc-body {
    min-height: 420px;
    padding: 28px 34px;
    border: 1px solid #edf1f7;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 12px 32px rgb(15 23 42 / 6%);

    h3 {
      margin: 0 0 22px;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
      text-align: center;
    }

    p {
      color: #344054;
      font-size: 14px;
      line-height: 1.8;
    }
  }

  .doc-section {
    margin-top: 16px;

    strong {
      color: #172033;
      font-size: 14px;
    }

    p {
      margin: 6px 0 0;
    }
  }

  .doc-meta {
    justify-content: space-between;
    gap: 12px;
    margin-top: 28px;
    color: #667085;
    font-size: 13px;
  }
</style>
