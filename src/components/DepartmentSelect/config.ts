import { toTree } from 'y-element-ultra';
import { listOrganizations } from '@/api/system/organization';

/**
 * 部门id字段名
 */
export const departmentIdField = 'organizationId';

/**
 * 部门名字段名
 */
export const departmentNameField = 'organizationName';

/**
 * 部门查询接口
 */
export const listDepartmentApi = async () => {
  const res = await $http(listOrganizations());
  return toTree({
    data: res.data || [],
    idField: departmentIdField,
    parentIdField: 'parentId'
  });
};
