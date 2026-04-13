import type { PageParam } from '@/api';

/**
 * 角色
 */
export interface Role {
  /** 角色id */
  roleId?: number;
  /** 角色作用域 */
  scopeType?: string;
  /** 所属租户id */
  tenantId?: number;
  /** 角色标识 */
  roleCode?: string;
  /** 角色名称 */
  roleName?: string;
  /** 数据权限范围 */
  dataScope?: string;
  /** 是否系统内置角色 */
  isSystemRole?: number;
  /** 备注 */
  comments?: string;
  /** 创建时间 */
  createTime?: string;
}

/**
 * 角色搜索条件
 */
export interface RoleParam extends PageParam {
  /** 角色名称 */
  roleName?: string;
  /** 角色标识 */
  roleCode?: string;
  /** 备注 */
  comments?: string;
}
