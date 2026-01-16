import type { IDictType, IDictTypeQuery } from '../types/dict';
import type { IQueryPage } from '../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { dictTypeService } from '../modules/dict-type';
import { queryKeys } from '../query-keys';

type MaybeRef<T> = T | { value: T };

/**
 * 获取字典类型列表
 */
export function useDictTypeListQuery(query: MaybeRef<IDictTypeQuery & IQueryPage>) {
  return useQuery({
    queryKey: queryKeys.dictType.list(unref(query)),
    queryFn: () => dictTypeService.getDictList(unref(query)),
  });
}

/**
 * 获取字典类型详情
 */
export function useDictTypeDetailQuery(id: MaybeRef<string>, options?: { enabled?: MaybeRef<boolean> }) {
  return useQuery({
    queryKey: queryKeys.dictType.detail(unref(id)),
    queryFn: () => dictTypeService.getDictTypeDetail(unref(id)),
    enabled: options?.enabled,
  });
}

/**
 * 添加字典类型
 */
export function useAddDictTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IDictType) => dictTypeService.addDictType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictType.lists() });
    },
  });
}

/**
 * 更新字典类型
 */
export function useUpdateDictTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IDictType) => dictTypeService.updateDictType(data),
    onSuccess: (_: any, variables: IDictType) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictType.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dictType.detail(String(variables.id)) });
      }
    },
  });
}

/**
 * 删除字典类型
 */
export function useRemoveDictTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => dictTypeService.removeDictType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictType.lists() });
    },
  });
}
