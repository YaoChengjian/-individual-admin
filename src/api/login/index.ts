import request from '@/utils/https';
import type { ApiResult } from '@/api';
import type { LoginParam, LoginResult, CaptchaResult } from './model';

/**
 * 登录
 */
export function login(data: LoginParam) {
  return request.post<ApiResult<LoginResult>>('/login', data);
}

/**
 * 获取验证码
 */
export function getCaptcha() {
  return request.post<ApiResult<CaptchaResult>>('/captcha');
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<ApiResult<unknown>>('/logout');
}
