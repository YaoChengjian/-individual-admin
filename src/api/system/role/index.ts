import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { Role, RoleParam } from './model';
import type { Menu } from '../menu/model';

/**
 * 分页查询角色
 */
export async function pageRoles(params: RoleParam) {
  const res = await request.post<ApiResult<PageResult<Role>>>(
    '/system/role/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 查询角色列表
 */
export async function listRoles(params?: RoleParam) {
  const res = await request.post<ApiResult<Role[]>>(
    '/system/role/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 添加角色
 */
export async function addRole(data: Role) {
  const res = await request.post<ApiResult<unknown>>('/system/role/add', data);
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 修改角色
 */
export async function updateRole(data: Role) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/role/update',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 删除角色
 */
export async function removeRole(id?: number) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/role/remove/${id}`
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 批量删除角色
 */
export async function removeRoles(data: (number | undefined)[]) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/role/remove/batch',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 获取角色分配的菜单
 */
export async function listRoleMenus(roleId?: number) {
  const res = await request.post<ApiResult<Menu[]>>(
    `/system/role-menu/list/${roleId}`
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 修改角色菜单
 */
export async function updateRoleMenus(roleId?: number, data?: number[]) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/role-menu/update/${roleId}`,
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}
