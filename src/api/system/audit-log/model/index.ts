import type { PageParam } from '@/api';

/**
 * 审计日志
 */
export interface AuditLog {
  id?: number;
  actorUserId?: number;
  actorName?: string;
  auditType?: string;
  targetType?: string;
  targetId?: string;
  summary?: string;
  beforeJson?: string;
  afterJson?: string;
  riskLevel?: string;
  ip?: string;
  traceId?: string;
  createTime?: string;
}

/**
 * 审计日志搜索条件
 */
export interface AuditLogParam extends PageParam {
  auditType?: string;
  actorName?: string;
  riskLevel?: string;
  targetType?: string;
  createTimeStart?: string;
  createTimeEnd?: string;
}
