import request from '@/utils/https';
import type { ApiResult, PageResult } from '@/api';
import type {
  UserMessage,
  UserMessageParam,
  UserMessageType,
  UserMessageUnread
} from './model';

/**
 * 查询未处理消息
 */
export function listUnreadUserMessages() {
  return request.post<ApiResult<UserMessageUnread>>(
    '/user/message/unread/list'
  );
}

/**
 * 分页查询消息
 */
export function pageUserMessages(params: UserMessageParam) {
  return request.post<ApiResult<PageResult<UserMessage>>>(
    '/user/message/page',
    params
  );
}

/**
 * 更新消息状态
 */
export function updateUserMessageStatus(
  messageType: UserMessageType,
  ids: number[]
) {
  return request.post<ApiResult<unknown>>('/user/message/status/update', {
    messageType,
    ids
  });
}

/**
 * 删除消息
 */
export function removeUserMessages(ids: number[]) {
  return request.post<ApiResult<unknown>>('/user/message/remove', {
    ids
  });
}
