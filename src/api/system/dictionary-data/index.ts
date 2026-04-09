import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type { DictionaryData, DictionaryDataParam } from './model';

/**
 * 分页查询字典数据
 */
export async function pageDictionaryData(params: DictionaryDataParam) {
  const res = await request.post<ApiResult<PageResult<DictionaryData>>>(
    '/system/dictionary-data/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 查询字典数据列表
 */
export async function listDictionaryData(params?: DictionaryDataParam) {
  const res = await request.post<ApiResult<DictionaryData[]>>(
    '/system/dictionary-data/list',
    params
  );
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 添加字典数据
 */
export async function addDictionaryData(data: DictionaryData) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/dictionary-data/add',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 修改字典数据
 */
export async function updateDictionaryData(data: DictionaryData) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/dictionary-data/update',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 删除字典数据
 */
export async function removeDictionaryData(id?: number) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/dictionary-data/remove/${id}`
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

/**
 * 批量删除字典数据
 */
export async function removeDictionaryDataBatch(data: (number | undefined)[]) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/dictionary-data/remove/batch',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}
