import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { Menu, MenuParam } from './model';

/**
 * 分页查询菜单
 */
export async function pageMenus(params: MenuParam) {
  const res = await request.post<ApiResult<PageResult<Menu>>>(
    '/system/menu/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 查询菜单列表
 */
export async function listMenus(params?: MenuParam) {
  const res = await request.post<ApiResult<Menu[]>>(
    '/system/menu/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 添加菜单
 */
export async function addMenu(data: Menu) {
  const res = await request.post<ApiResult<unknown>>('/system/menu/add', data);
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 修改菜单
 */
export async function updateMenu(data: Menu) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/menu/update',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 删除菜单
 */
export async function removeMenu(id?: number) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/menu/remove/${id}`
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}
