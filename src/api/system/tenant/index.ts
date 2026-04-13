import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { Tenant, TenantParam, TenantStatusParam } from './model';

/**
 * 分页查询租户
 */
export async function pageTenants(params: TenantParam) {
  const res = await request.post<ApiResult<PageResult<Tenant>>>(
    '/system/tenant/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 查询租户列表
 */
export async function listTenants(params?: TenantParam) {
  const res = await request.post<ApiResult<Tenant[]>>(
    '/system/tenant/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 添加租户
 */
export async function addTenant(data: Tenant) {
  const res = await request.post<ApiResult<unknown>>('/system/tenant/add', data);
  if (res.data.code === 0) {
    return res.data.message ?? '添加成功';
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 修改租户
 */
export async function updateTenant(data: Tenant) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/tenant/update',
    data
  );
  if (res.data.code === 0) {
    return res.data.message ?? '修改成功';
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 更新租户状态
 */
export async function updateTenantStatus(data: TenantStatusParam) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/tenant/status/update',
    data
  );
  if (res.data.code === 0) {
    return res.data.message ?? '状态更新成功';
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 删除租户
 */
export async function removeTenant(id?: number) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/tenant/remove/${id}`
  );
  if (res.data.code === 0) {
    return res.data.message ?? '删除成功';
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 批量删除租户
 */
export async function removeTenants(data: (number | undefined)[]) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/tenant/remove/batch',
    data
  );
  if (res.data.code === 0) {
    return res.data.message ?? '删除成功';
  }
  return Promise.reject(new Error(res.data.message));
}
