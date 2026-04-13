<template>
  <y-page>
    <audit-log-search @search="(where) => reload(where, 1)" />
    <y-card :body-style="{ paddingTop: '8px' }">
      <y-pro-table
        ref="tableRef"
        row-key="id"
        :columns="columns"
        :datasource="datasource"
        :show-overflow-tooltip="true"
        :highlight-current-row="true"
        cache-key="SystemAuditLogTable"
      >
        <template #toolbar>
          <btn-items
            :items="[
              {
                preset: 'export',
                props: { type: 'primary' },
                onClick: () => exportData()
              }
            ]"
          />
        </template>
        <template #riskLevel="{ row }">
          <el-tag
            size="small"
            :type="riskTagType[row.riskLevel || 'low'] || 'info'"
            :disable-transitions="true"
          >
            {{ riskLabel[row.riskLevel || 'low'] || row.riskLevel }}
          </el-tag>
        </template>
        <template #action="{ row }">
          <btn-items
            divider
            type="link"
            :items="[{ preset: 'detail', onClick: () => openDetail(row) }]"
          />
        </template>
      </y-pro-table>
    </y-card>
  </y-page>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import ExcelJS from 'exceljs';
  import { YMessage, useModal } from 'y-element-ultra';
  import type { YProTable } from 'y-element-ultra';
  import type { DatasourceFunction, Columns } from 'y-element-ultra/es/y-pro-table/types';
  import { download } from '@/utils/common';
  import AuditLogSearch from './components/audit-log-search.vue';
  import { listAuditLogs, pageAuditLogs } from '@/api/system/audit-log';
  import type { AuditLog, AuditLogParam } from '@/api/system/audit-log/model';

  defineOptions({ name: 'SystemAuditLog' });

  const { openModal } = useModal();
  const tableRef = ref<InstanceType<typeof YProTable> | null>(null);

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

  const columns = ref<Columns>([
    { type: 'index', columnKey: 'index', width: 50, align: 'center' },
    { prop: 'actorName', label: '操作人', sortable: 'custom', minWidth: 120 },
    { prop: 'auditType', label: '审计类型', sortable: 'custom', minWidth: 140 },
    { prop: 'targetType', label: '目标类型', minWidth: 110 },
    { prop: 'targetId', label: '目标ID', minWidth: 130 },
    { prop: 'summary', label: '审计摘要', minWidth: 240 },
    { prop: 'riskLevel', label: '风险级别', width: 100, align: 'center', slot: 'riskLevel' },
    { prop: 'ip', label: 'IP地址', width: 140, align: 'center' },
    { prop: 'createTime', label: '操作时间', sortable: 'custom', width: 180, align: 'center' },
    {
      columnKey: 'action',
      label: '操作',
      width: 90,
      align: 'center',
      slot: 'action',
      hideInPrint: true,
      hideInExport: true
    }
  ]);

  const datasource: DatasourceFunction = ({ pages, where, orders }) => {
    return pageAuditLogs({ ...where, ...orders, ...pages });
  };

  const reload = (where?: AuditLogParam, page?: number) => {
    tableRef.value?.reload?.({ where, page });
  };

  const openDetail = (row: AuditLog) => {
    openModal({
      props: { title: '详情', width: 720 },
      asyncComponent: () => import('./components/audit-log-detail.vue'),
      componentProps: { data: row }
    });
  };

  const exportData = () => {
    const loading = YMessage.loading({ message: '请求中..', plain: true });
    tableRef.value?.fetch?.(({ where, orders }) => {
      listAuditLogs({ ...where, ...orders })
        .then((data) => {
          const workbook = new ExcelJS.Workbook();
          const sheet = workbook.addWorksheet('Sheet1');
          sheet.addRow([
            '操作人',
            '审计类型',
            '目标类型',
            '目标ID',
            '审计摘要',
            '风险级别',
            'IP地址',
            '操作时间'
          ]);
          data.forEach((d) => {
            sheet.addRow([
              d.actorName,
              d.auditType,
              d.targetType,
              d.targetId,
              d.summary,
              riskLabel[d.riskLevel || 'low'],
              d.ip,
              d.createTime
            ]);
          });
          [16, 18, 14, 16, 36, 12, 18, 24].forEach((width, index) => {
            sheet.getColumn(index + 1).width = width;
          });
          sheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
            row.height = 20;
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
              cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
              };
              cell.font = { size: 12, bold: rowIndex === 1 };
            });
          });
          workbook.xlsx.writeBuffer().then((buffer) => {
            download(buffer, '审计日志.xlsx');
            loading.close();
          });
        })
        .catch((e) => {
          loading.close();
          YMessage.error({ message: e.message, plain: true });
        });
    });
  };
</script>
