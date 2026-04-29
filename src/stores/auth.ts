import type { ILoginAccount, ILoginResponse, IUserInfo } from '@/services/types/login';
import md5 from 'md5';
import { defineStore } from 'pinia';
import { useNuxtConfirm } from '@/composables/useNuxtConfirm.ts';
import { LOGIN_URL } from '@/global/constants';
import router from '@/router';
import { loginService } from '@/services/modules/login';
import { to } from '@/utils/result-handler';
import { StorageUtil } from '@/utils/storage';

/**
 * 用户认证 Store
 */
export const useAuthStore = defineStore('auth', () => {
  const token = ref(StorageUtil.get('accessToken') ?? '');
  const userInfo = ref<IUserInfo>();
  const confirm = useNuxtConfirm();

  const isLogin = computed(() => {
    return !!token.value;
  });

  const getToken = computed(() => {
    return token.value;
  });

  const setToken = (_token: string) => {
    token.value = _token;
  };

  const setUserInfo = (_userInfo: IUserInfo) => {
    userInfo.value = _userInfo;
  };
  const loginAction = async (account: ILoginAccount, homePath?: string | undefined, redirect: boolean = true) => {
    const result = await to<ILoginResponse>(
      loginService.login({
        username: account.username,
        password: md5(account.password),
        captcha: account.captcha,
        captchaId: account.captchaId,
      }),
    );
    if (!result.ok)
      return Promise.reject(result.error);
    const { accessToken, userInfo } = result.value;
    setToken(accessToken);
    StorageUtil.set('accessToken', accessToken);

    setUserInfo(userInfo);

    if (redirect) {
      await router.replace({
        name: homePath ?? 'dashboard',
      });
    }
  };

  const logoutAction = async () => {
    await confirm.confirmWarning({
      message: '确定退出登录吗?',
      title: '提示',
      accept: async () => {
        const result = await to(loginService.logout());
        if (!result.ok)
          return;
        setToken('');
        StorageUtil.remove('accessToken');
        setUserInfo({} as IUserInfo);
        await router.replace(LOGIN_URL);
      },
    });
  };

  return {
    userInfo,
    isLogin,
    getToken,
    setToken,
    setUserInfo,
    loginAction,
    logoutAction,
  };
});
