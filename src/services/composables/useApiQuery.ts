import type { IApi, IApiParams, IApiSync } from '../types/api';
import type { IPageResult } from '../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { addApi, batchCreateApi, deleteApi, editApi, getApiList, ignoreApi, syncApi, updateApiCache } from '../modules/api';

type MaybeRef<T> = T | { value: T };

/**
 * 获取 API 列表
 */
export function useApiListQuery(
  query: MaybeRef<IApiParams>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  const queryKey = computed(() => {
    const q = unref(query);
    return ['api', 'list', {
      current: q.current,
      size: q.size,
      path: q.path,
      method: q.method,
      tags: q.tags,
      description: q.description,
    }] as const;
  });

  return useQuery({
    queryKey,
    queryFn: async () => getApiList(unref(query)),
    enabled: options?.enabled,
    placeholderData: (previousData: IPageResult<IApi[]>) => previousData,
  });
}

/**
 * 同步 API
 */
export function useSyncApiQuery(
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: ['api', 'sync'] as const,
    queryFn: async () => syncApi(),
    enabled: options?.enabled,
  });
}

/**
 * 添加 API
 */
export function useAddApiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IApi) => addApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['api', 'sync'] });
    },
  });
}

/**
 * 编辑 API
 */
export function useEditApiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IApi) => editApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'list'] });
    },
  });
}

/**
 * 删除 API
 */
export function useDeleteApiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => deleteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'list'] });
    },
  });
}

/**
 * 忽略 API
 */
export function useIgnoreApiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IApi) => ignoreApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'sync'] });
    },
  });
}

/**
 * 批量创建 API
 */
export function useBatchCreateApiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IApi[]) => batchCreateApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['api', 'sync'] });
    },
  });
}

/**
 * 更新 API 缓存
 */
export function useUpdateApiCacheMutation() {
  return useMutation({
    mutationFn: async () => updateApiCache(),
  });
}
