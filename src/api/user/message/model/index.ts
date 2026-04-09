import type { PageParam } from '@/api';

export type UserMessageType = 'notice' | 'letter' | 'todo';

/**
 * 用户消息
 */
export interface UserMessage {
  /** 消息id */
  id: number;
  /** 消息类型 */
  messageType: UserMessageType;
  /** 标题 */
  title: string;
  /** 时间 */
  time: string;
  /** 状态 */
  status: number;
  /** 内容 */
  content?: string;
  /** 头像 */
  avatar?: string;
  /** 图标 */
  icon?: string;
  /** 图标背景色 */
  color?: string;
}

/**
 * 消息分页参数
 */
export interface UserMessageParam extends PageParam {
  /** 消息类型 */
  messageType: UserMessageType;
  /** 标题 */
  title?: string;
  /** 关键字 */
  keywords?: string;
  /** 状态 */
  status?: number;
}

/**
 * 未处理消息分组
 */
export interface UserMessageUnread {
  notices: UserMessage[];
  letters: UserMessage[];
  todos: UserMessage[];
}
