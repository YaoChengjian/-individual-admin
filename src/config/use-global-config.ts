import { ref } from 'vue';
import type { TableGlobalConfig } from 'y-element-ultra/es/y-config-provider/types';
import { exceljsExportPlugin } from 'y-element-ultra/es/y-pro-table/exceljs-plugin';

/**
 * 组件全局配置
 */
export function useGlobalConfig() {
  /** 高级表格全局配置 */
  const tableConfig = ref<TableGlobalConfig>({
    response: {
      dataName: 'list',
      countName: 'count'
    },
    tools: ['reload', 'export', 'print', 'size', 'columns', 'maximized'],
    exportConfig: {
      // 使用 exceljs 进行导出
      exportPlugin: exceljsExportPlugin
    }
  });

  return { tableConfig };
}
