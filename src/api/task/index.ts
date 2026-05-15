import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type {
  PatrolArea,
  PatrolAreaForm,
  PatrolExecutor,
  PatrolPoint,
  PatrolPointForm,
  PatrolTask,
  PatrolTaskCreateForm,
  PatrolTaskCreateOptions,
  PatrolTaskDetail,
  PatrolTaskDetailParam,
  PatrolTaskParam,
  PatrolTaskPrintedWorkOrder,
  PatrolTaskSummary,
  PatrolTaskTourStatus,
  PatrolTaskWorkOrderParam,
  PatrolTaskUpdateForm
} from './model';

export async function pagePatrolTasks(params: PatrolTaskParam) {
  const res = await request.post<ApiResult<PageResult<PatrolTask>>>(
    '/admin/task/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listPatrolTasks(params?: PatrolTaskParam) {
  const res = await request.post<ApiResult<PatrolTask[]>>(
    '/admin/task/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function getPatrolTaskSummary(params?: PatrolTaskParam) {
  const res = await request.post<ApiResult<PatrolTaskSummary>>(
    '/admin/task/summary',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function getPatrolTaskDetail(params: PatrolTaskDetailParam) {
  const res = await request.post<ApiResult<PatrolTaskDetail>>(
    '/admin/task/detail',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listPrintedWorkOrders(params: PatrolTaskDetailParam) {
  const res = await request.post<ApiResult<PatrolTaskPrintedWorkOrder[]>>(
    '/admin/task/work-orders/printed',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function pagePrintedWorkOrders(params: PatrolTaskWorkOrderParam) {
  const res = await request.post<
    ApiResult<PageResult<PatrolTaskPrintedWorkOrder>>
  >('/admin/task/work-orders/printed/page', params);
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function getTaskTourStatus(tourKey = 'task-management') {
  const res = await request.post<ApiResult<PatrolTaskTourStatus>>(
    '/admin/task/tour/status',
    { tourKey }
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function hideTaskTourToday(tourKey = 'task-management') {
  const res = await request.post<ApiResult<unknown>>(
    '/admin/task/tour/hide-today',
    {
      tourKey
    }
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function getPatrolTaskCreateOptions() {
  const res = await request.post<ApiResult<PatrolTaskCreateOptions>>(
    '/admin/task/create-options'
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listPatrolAreas() {
  const res = await request.post<ApiResult<PatrolArea[]>>(
    '/admin/task/area/list'
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function savePatrolArea(data: PatrolAreaForm) {
  const res = await request.post<ApiResult<PatrolArea>>(
    '/admin/task/area/save',
    data
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listPatrolPoints(areaIds?: number[]) {
  const res = await request.post<ApiResult<PatrolPoint[]>>(
    '/admin/task/point/list',
    areaIds || []
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function addPatrolPoint(data: PatrolPointForm) {
  const res = await request.post<ApiResult<PatrolPoint>>(
    '/admin/task/point/add',
    data
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function removePatrolPoint(pointId: number) {
  const res = await request.post<ApiResult<unknown>>(
    '/admin/task/point/remove',
    {
      pointId
    }
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listPatrolExecutors() {
  const res = await request.post<ApiResult<PatrolExecutor[]>>(
    '/admin/task/executor/list'
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function addPatrolTask(data: PatrolTaskCreateForm) {
  const res = await request.post<ApiResult<PatrolTask>>(
    '/admin/task/add',
    data
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function updatePatrolTask(data: PatrolTaskUpdateForm) {
  const res = await request.post<ApiResult<PatrolTask>>(
    '/admin/task/update',
    data
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}
