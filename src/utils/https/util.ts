import type { AxiosResponse } from 'axios';
import type { App, InjectionKey, Plugin } from 'vue';
import { inject } from 'vue';
import type { ApiResult } from '@/api';
import { YMessage } from 'y-element-ultra';

/**
 * 全局请求处理注入键名
 */
export const HTTP_UTIL_KEY: InjectionKey<HttpHandler> = Symbol('$http');

/**
 * 全局请求成功回调
 */
export type HttpSuccessCallback<T = unknown> = (res: ApiResult<T>) => void;

/**
 * 全局请求失败回调
 */
export type HttpErrorCallback = (error: Error) => void;

type HttpRequestResult<T> =
  | ApiResult<T>
  | AxiosResponse<ApiResult<T>>
  | null
  | undefined;

/**
 * 判断是否为 axios 响应对象
 *
 * @param response 接口返回结果，可能是 axios 包装对象，也可能已经是后端响应体
 * @returns 是否为 axios 原始响应对象
 */
function isAxiosResponse<T>(
  response: ApiResult<T> | AxiosResponse<ApiResult<T>>
): response is AxiosResponse<ApiResult<T>> {
  return (
    typeof response === 'object' &&
    response != null &&
    'status' in response &&
    'config' in response
  );
}

/**
 * 将 axios 响应对象统一提取为接口响应体
 *
 * @param response 接口返回结果，兼容 axios 原始响应对象和后端响应体
 * @returns 后端统一响应体 ApiResult
 */
function unwrapApiResult<T>(
  response: ApiResult<T> | AxiosResponse<ApiResult<T>>
): ApiResult<T> {
  if (isAxiosResponse(response)) {
    return response.data;
  }
  return response;
}

/**
 * 规范化错误对象
 *
 * @param error 任意异常对象
 * @returns 标准 Error 实例，便于统一提示和回调处理
 */
function normalizeHttpError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  return new Error('请求失败');
}

/**
 * 统一的网络请求处理
 *
 * @description 重载声明一：仅传入请求 Promise，适合 async/await 场景。
 * @param requestPromise 接口请求 Promise，支持直接传 request.post(...) 返回值
 * @returns 成功时返回后端统一响应体，失败时抛出错误，适合 async/await 场景
 */
function httpRequest<T = unknown>(
  requestPromise: Promise<HttpRequestResult<T>>
): Promise<ApiResult<T>>;

/**
 * 统一的网络请求处理
 *
 * @description 重载声明二：传入成功、失败回调和错误处理开关，适合传统回调写法。
 * @param requestPromise 接口请求 Promise，支持直接传 request.post(...) 返回值
 * @param successCallback 请求成功回调，后端返回 code === 0 时触发
 * @param errorCallback 请求失败回调，网络异常或业务 code !== 0 时触发
 * @param selfHandle 是否自行处理错误提示，默认 true，true 表示不弹内部默认错误消息
 * @returns 成功时返回后端统一响应体，失败时返回 undefined
 */
function httpRequest<T = unknown>(
  requestPromise: Promise<HttpRequestResult<T>>,
  successCallback?: HttpSuccessCallback<T>,
  errorCallback?: HttpErrorCallback,
  selfHandle?: boolean
): Promise<ApiResult<T> | undefined>;

/**
 * 统一的网络请求处理实现
 *
 * @description 上面两个同名函数是 TypeScript 的重载声明，这里才是真正执行的实现体。
 * @param requestPromise 接口请求 Promise，兼容 ApiResult 和 AxiosResponse<ApiResult>
 * @param successCallback 请求成功回调，后端返回 code === 0 时执行
 * @param errorCallback 请求失败回调，网络异常或业务异常时执行
 * @param selfHandle 是否自行处理错误提示，默认 true，true 时不弹出内部全局错误消息
 * @returns 成功时返回后端统一响应体，失败时根据调用模式返回 undefined 或抛出错误
 */
async function httpRequest<T = unknown>(
  requestPromise: Promise<HttpRequestResult<T>>,
  successCallback?: HttpSuccessCallback<T>,
  errorCallback?: HttpErrorCallback,
  selfHandle = true
) {
  const useThrowMode = successCallback == null && errorCallback == null;

  try {
    const response = await requestPromise;
    if (!response) {
      throw new Error('请求失败');
    }
    const res = unwrapApiResult(response);
    if (res.code === 0) {
      successCallback?.(res);
      return res;
    }
    throw new Error(res.message || '请求失败');
  } catch (error) {
    const err = normalizeHttpError(error);
    if (!selfHandle) {
      YMessage.error({
        message: err.message,
        duration: 5 * 1000,
        plain: true
      });
    }
    errorCallback?.(err);
    if (useThrowMode) {
      throw err;
    }
    return;
  }
}

/**
 * 暴露给业务直接使用的全局请求方法
 */
export const $http = httpRequest;

/**
 * 全局请求处理方法
 */
export type HttpHandler = typeof $http;

type HttpGlobal = typeof globalThis & {
  $http: HttpHandler;
};

/**
 * 将请求方法同步到运行时全局对象，配合 vite define 后可直接使用 $http(...)
 *
 * @returns void
 */
function registerGlobalHttpUtil() {
  (globalThis as HttpGlobal).$http = $http;
}

registerGlobalHttpUtil();

/**
 * 挂载全局请求处理方法
 *
 * @param app Vue 应用实例
 * @returns void
 */
export function installHttpUtil(app: App) {
  app.config.globalProperties.$http = $http;
  app.provide(HTTP_UTIL_KEY, $http);
  registerGlobalHttpUtil();
}

/**
 * 全局请求处理插件
 */
export const httpUtilInstaller: Plugin = {
  install: installHttpUtil
};

/**
 * 组合式下获取全局请求处理方法
 *
 * @returns 当前注入的全局请求处理方法，未注入时回退到默认 $http
 */
export function useHttpUtil() {
  return inject(HTTP_UTIL_KEY, $http);
}

export default httpUtilInstaller;
