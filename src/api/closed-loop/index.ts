import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type {
  ClosedLoopParam,
  DashboardSummary,
  InspectionReport,
  LawDocument,
  MapPointsPayload,
  PersonnelDevice,
  PushRecord,
  TimelineItem,
  WorkOrder,
  WorkOrderActionForm,
  WorkOrderDetail
} from './model';

const unwrap = <T>(res: { data: ApiResult<T> }) => {
  if (res.data.code === 0 && res.data.data !== undefined) {
    return res.data.data;
  }
  throw new Error(res.data.message);
};

export async function getClosedLoopSummary() {
  return unwrap(
    await request.post<ApiResult<DashboardSummary>>(
      '/closed-loop/dashboard/summary'
    )
  );
}

export async function getClosedLoopMapPoints() {
  return unwrap(
    await request.post<ApiResult<MapPointsPayload>>(
      '/closed-loop/dashboard/map-points'
    )
  );
}

export async function getClosedLoopTimeline() {
  return unwrap(
    await request.post<ApiResult<TimelineItem[]>>(
      '/closed-loop/activity/timeline'
    )
  );
}

export async function pageWorkOrders(params: ClosedLoopParam) {
  return unwrap(
    await request.post<ApiResult<PageResult<WorkOrder>>>(
      '/patrol-mvp/work-order/page',
      params
    )
  );
}

export async function listWorkOrders(params?: ClosedLoopParam) {
  const page = await pageWorkOrders({ limit: 500, ...(params || {}) });
  return page.list;
}

export async function getWorkOrderDetail(id: number) {
  return unwrap(
    await request.post<ApiResult<WorkOrderDetail>>(
      '/patrol-mvp/work-order/detail',
      { workOrderId: id }
    )
  );
}

export async function workOrderAction(data: WorkOrderActionForm) {
  if (data.action === 'push') {
    const res = await request.post<
      ApiResult<{ workOrder: WorkOrder; pushRecord: PushRecord }>
    >('/patrol-mvp/work-order/push', data);
    return unwrap(res).workOrder;
  }
  if (data.action === 'generate-document') {
    await unwrap(
      await request.post<ApiResult<LawDocument>>(
        '/patrol-mvp/document/generate',
        {
          workOrderId: data.workOrderId
        }
      )
    );
    const detail = await getWorkOrderDetail(data.workOrderId);
    return detail.workOrder;
  }
  return unwrap(
    await request.post<ApiResult<WorkOrder>>(
      '/closed-loop/work-order/action',
      data
    )
  );
}

export async function pageInspectionReports(params: ClosedLoopParam) {
  return unwrap(
    await request.post<ApiResult<PageResult<InspectionReport>>>(
      '/closed-loop/report/page',
      params
    )
  );
}

export async function listInspectionReports(params?: ClosedLoopParam) {
  return unwrap(
    await request.post<ApiResult<InspectionReport[]>>(
      '/closed-loop/report/list',
      params || {}
    )
  );
}

export async function archiveInspectionReport(id: number) {
  return unwrap(
    await request.post<ApiResult<InspectionReport>>(
      '/closed-loop/report/archive',
      { id }
    )
  );
}

export async function pageLawDocuments(params: ClosedLoopParam) {
  return unwrap(
    await request.post<ApiResult<PageResult<LawDocument>>>(
      '/patrol-mvp/document/page',
      params
    )
  );
}

export async function getLawDocumentDetail(documentId: number) {
  return unwrap(
    await request.post<ApiResult<LawDocument>>('/patrol-mvp/document/detail', {
      documentId
    })
  );
}

export async function mockPrintLawDocument(documentId: number) {
  const data = await unwrap(
    await request.post<ApiResult<{ document: LawDocument }>>(
      '/patrol-mvp/document/mock-print',
      { documentId, operatorName: '指挥中心操作员' }
    )
  );
  return data.document;
}

export async function pagePushRecords(params: ClosedLoopParam) {
  return unwrap(
    await request.post<ApiResult<PageResult<PushRecord>>>(
      '/patrol-mvp/push-record/page',
      params
    )
  );
}

export async function listPersonnelDevices() {
  return unwrap(
    await request.post<ApiResult<PersonnelDevice[]>>(
      '/closed-loop/personnel/devices'
    )
  );
}
