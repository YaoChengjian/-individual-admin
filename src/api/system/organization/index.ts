import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { Organization, OrganizationParam } from './model';

/**
 * 分页查询机构
 */
export function pageOrganizations(params: OrganizationParam) {
  return request.post<ApiResult<PageResult<Organization>>>(
    '/system/organization/page',
    params
  );
}

/**
 * 查询机构列表
 */
export function listOrganizations(params?: OrganizationParam) {
  return request.post<ApiResult<Organization[]>>(
    '/system/organization/list',
    params
  );
}

/**
 * 查询机构列表树
 */
export function listOrganizationsTree(params?: OrganizationParam) {
  return request.post<ApiResult<Organization[]>>(
    '/system/organization/tree',
    params
  );
}

/**
 * 添加机构
 */
export function addOrganization(data: Organization) {
  return request.post<ApiResult<unknown>>('/system/organization/add', data);
}

/**
 * 修改机构
 */
export function updateOrganization(data: Organization) {
  return request.post<ApiResult<unknown>>('/system/organization/update', data);
}

/**
 * 删除机构
 */
export function removeOrganization(id?: number) {
  return request.post<ApiResult<unknown>>(`/system/organization/remove/${id}`);
}
