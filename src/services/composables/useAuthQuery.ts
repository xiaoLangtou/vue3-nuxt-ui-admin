import type { ILoginAccount } from '../types/login';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { loginService } from '../modules/login';
import { queryKeys } from '../query-keys';

type MaybeRef<T> = T | { value: T };

/**
 * 获取验证码
 */
export function useCaptchaQuery() {
  return useQuery({
    queryKey: queryKeys.auth.captcha(),
    queryFn: () => loginService.getCaptchaImage(),
    staleTime: 0,
  });
}

/**
 * 获取用户信息
 */
export function useUserInfoQuery(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.auth.userInfo(),
    queryFn: () => loginService.getUserInfo(),
    enabled: options?.enabled,
  });
}

/**
 * 获取用户菜单列表
 */
export function useMenuListQuery(options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.auth.menuList(),
    queryFn: () => loginService.getMenuList(),
    enabled: options?.enabled,
  });
}

/**
 * 登录 Mutation
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (account: ILoginAccount) => loginService.login(account),
    onSuccess: () => {
      // 登录成功后，使相关查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.userInfo() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.menuList() });
    },
  });
}

/**
 * 退出登录 Mutation
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => loginService.logout(),
    onSuccess: () => {
      // 退出登录后，清除所有缓存
      queryClient.clear();
    },
  });
}
