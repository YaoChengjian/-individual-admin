import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { AuditLog, AuditLogParam } from './model';

export async function pageAuditLogs(params: AuditLogParam) {
  const res = await request.post<ApiResult<PageResult<AuditLog>>>(
    '/system/audit-log/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listAuditLogs(params?: AuditLogParam) {
  const res = await request.post<ApiResult<AuditLog[]>>(
    '/system/audit-log/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}
