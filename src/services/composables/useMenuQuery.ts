import type { IMenu } from '../types/menu';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';

import {
  batchCreateButtons,
  createMenu,
  deleteMenu,
  getMenuDetail,
  getMenuTreeList,
  updateMenu,
} from '../modules/menu';
import { queryKeys } from '../query-keys';

type MaybeRef<T> = T | { value: T };

/**
 * 获取菜单树列表
 */
export function useMenuTreeQuery(name?: MaybeRef<string>) {
  return useQuery({
    queryKey: queryKeys.menu.tree(unref(name)),
    queryFn: async () => getMenuTreeList(unref(name)),
  });
}

/**
 * 获取菜单详情
 */
export function useMenuDetailQuery(
  id: MaybeRef<number | undefined>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: queryKeys.menu.detail(unref(id) || 0),
    queryFn: async () => getMenuDetail(unref(id)),
    enabled: options?.enabled ?? !!unref(id),
  });
}

/**
 * 创建菜单
 */
export function useCreateMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IMenu) => createMenu(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
    },
  });
}

/**
 * 更新菜单
 */
export function useUpdateMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IMenu) => updateMenu(params),
    onSuccess: (_: any, variables: IMenu) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.menu.detail(variables.id),
        });
      }
    },
  });
}

/**
 * 删除菜单
 */
export function useDeleteMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
    },
  });
}

/**
 * 批量创建按钮
 */
export function useBatchCreateButtonsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, buttons }: { menuId: string; buttons: any[] }) =>
      batchCreateButtons(menuId, buttons),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menu.all });
    },
  });
}
