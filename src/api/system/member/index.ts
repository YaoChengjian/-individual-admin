import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type {
  Member,
  MemberInvite,
  MemberInviteForm,
  MemberInviteParam,
  MemberParam
} from './model';

export async function pageMembers(params: MemberParam) {
  const res = await request.post<ApiResult<PageResult<Member>>>(
    '/system/member/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function listMembers(params?: MemberParam) {
  const res = await request.post<ApiResult<Member[]>>('/system/member/list', params);
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function getMember(id: number) {
  const res = await request.post<ApiResult<Member>>(`/system/member/detail/${id}`);
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function addMember(data: Member) {
  const res = await request.post<ApiResult<unknown>>('/system/member/add', data);
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function updateMember(data: Member) {
  const res = await request.post<ApiResult<unknown>>('/system/member/update', data);
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function updateMemberStatus(userId?: number, status?: number) {
  const res = await request.post<ApiResult<unknown>>('/system/member/status/update', {
    userId,
    status
  });
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function removeMember(id?: number) {
  const res = await request.post<ApiResult<unknown>>(`/system/member/remove/${id}`);
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function removeMembers(data: (number | undefined)[]) {
  const res = await request.post<ApiResult<unknown>>(
    '/system/member/remove/batch',
    data
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function pageMemberInvites(params: MemberInviteParam) {
  const res = await request.post<ApiResult<PageResult<MemberInvite>>>(
    '/system/member/invite/page',
    params
  );
  if (res.data.code === 0) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function inviteMember(data: MemberInviteForm) {
  const res = await request.post<ApiResult<MemberInvite>>('/system/member/invite/add', data);
  if (res.data.code === 0 && res.data.data) {
    return res.data.data;
  }
  return Promise.reject(new Error(res.data.message));
}

export async function cancelMemberInvite(inviteId?: number) {
  const res = await request.post<ApiResult<unknown>>(
    `/system/member/invite/cancel/${inviteId}`
  );
  if (res.data.code === 0) {
    return res.data.message;
  }
  return Promise.reject(new Error(res.data.message));
}
