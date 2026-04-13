import type { PageParam } from '@/api';

/**
 * 租户
 */
export interface Tenant {
  /** 租户id */
  tenantId?: number;
  /** 租户编码 */
  tenantCode?: string;
  /** 租户名称 */
  tenantName?: string;
  /** 联系人 */
  contactName?: string;
  /** 联系电话 */
  contactPhone?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 隔离级别 */
  isolationLevel?: string;
  /** 状态 */
  status?: number;
  /** 到期时间 */
  expireTime?: string;
  /** 备注 */
  comments?: string;
  /** 成员数量 */
  memberCount?: number;
  /** 创建时间 */
  createTime?: string;
}

/**
 * 租户搜索条件
 */
export interface TenantParam extends PageParam {
  /** 租户名称 */
  tenantName?: string;
  /** 租户编码 */
  tenantCode?: string;
  /** 隔离级别 */
  isolationLevel?: string;
  /** 状态 */
  status?: number;
}

/**
 * 租户状态更新参数
 */
export interface TenantStatusParam {
  /** 租户id */
  tenantId?: number;
  /** 状态 */
  status?: number;
}
