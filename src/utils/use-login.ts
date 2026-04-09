import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { YMessage } from 'y-element-ultra';
import type { ApiResult } from '@/api';
import { getToken, setToken, removeToken } from '@/utils/token-util';
import { goLogin } from '@/utils/common';
import { usePageTab } from '@/utils/use-page-tab';
import { useUserStore } from '@/store/modules/user';
import { login as loginApi, logout as logoutApi } from '@/api/login';
import type { LoginParam, LoginResult } from '@/api/login/model';

/**
 * 登录操作
 */
export function useLogin() {
  const { t } = useI18n();
  const route = useRoute();
  const { cleanPageTabs, goHomeRoute } = usePageTab();
  const userStore = useUserStore();

  /**
   * 清空登录状态数据
   */
  const clearData = () => {
    cleanPageTabs();
    userStore.clearData();
  };

  /**
   * 跳转到首页
   */
  const goHome = () => {
    const from = route.query.from;
    goHomeRoute([from].flat()[0]);
  };

  /**
   * 登录请求
   * @param data 表单数据
   */
  const login = (data: LoginParam) => {
    return loginApi(data);
  };

  /**
   * 处理登录成功后的业务逻辑
   * @param result 登录接口返回结果
   * @param remember 是否记住密码
   */
  const handleLoginSuccess = (
    result: ApiResult<LoginResult>,
    remember?: boolean
  ) => {
    const token = result.data?.access_token;
    if (!token) {
      throw new Error(result.message || '登录失败');
    }
    YMessage.success({ message: result.message, plain: true });
    setToken(token, remember);
    clearData();
    goHome();
  };

  /**
   * 退出登录请求
   */
  const logout = () => {
    return logoutApi();
  };

  /**
   * 处理退出登录成功后的业务逻辑
   */
  const handleLogoutSuccess = () => {
    removeToken();
    //clearData();
    goLogin(void 0, false);
  };

  /**
   * 检查登录状态
   */
  const checkLogin = async () => {
    if (!getToken()) {
      return Promise.reject(new Error());
    }
    goHome();
  };

  /**
   * 弹出退出登录确认弹窗
   */
  const showLogoutConfirm = () => {
    ElMessageBox.confirm(t('layout.logout.message'), t('layout.logout.title'), {
      type: 'warning',
      draggable: true
    })
      .then(() => {
        const loading = YMessage.loading({
          message: '请求中..',
          plain: true
        });
        $http(
          logout(),
          () => {
            loading.close();
            handleLogoutSuccess();
          },
          (e) => {
            loading.close();
            YMessage.error({ message: e.message, plain: true });
          },
          true
        );
      })
      .catch(() => {});
  };

  return {
    login,
    handleLoginSuccess,
    logout,
    handleLogoutSuccess,
    checkLogin,
    goHome,
    showLogoutConfirm
  };
}
