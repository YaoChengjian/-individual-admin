import type { PageParam } from '@/api';
import type { User, UserParam } from '../../user/model';

/**
 * 租户成员
 */
export interface Member extends User {}

/**
 * 成员搜索条件
 */
export interface MemberParam extends UserParam {}

/**
 * 成员邀请记录
 */
export interface MemberInvite {
  inviteId?: number;
  tenantId?: number;
  inviteCode?: string;
  inviteUsername?: string;
  inviteEmail?: string;
  invitePhone?: string;
  nickname?: string;
  organizationId?: number;
  organizationName?: string;
  roleIds?: number[];
  roleNames?: string[];
  dataScope?: string;
  status?: number;
  expireTime?: string;
  invitedByUserId?: number;
  invitedByMemberId?: number;
  acceptedUserId?: number;
  comments?: string;
  createTime?: string;
}

/**
 * 邀请记录搜索条件
 */
export interface MemberInviteParam extends PageParam {
  keywords?: string;
  status?: number;
  organizationId?: number;
}

/**
 * 创建邀请参数
 */
export interface MemberInviteForm {
  inviteUsername?: string;
  inviteEmail?: string;
  invitePhone?: string;
  nickname?: string;
  organizationId?: number;
  roleIds?: number[];
  dataScope?: string;
  expireTime?: string;
  comments?: string;
}
