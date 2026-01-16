import type { IDictData, IDictDataQuery } from '../types/dict';
import type { IQueryPage } from '../types/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { unref } from 'vue';
import { dictDataService } from '../modules/dict-data';
import { queryKeys } from '../query-keys';

type MaybeRef<T> = T | { value: T };

/**
 * 获取字典数据列表
 */
export function useDictDataListQuery(
  query: MaybeRef<IDictDataQuery & IQueryPage & { typeId: number }>,
) {
  return useQuery({
    queryKey: queryKeys.dictData.list(unref(query)),
    queryFn: async () => dictDataService.getDictDataList(unref(query)),
  });
}

/**
 * 获取字典数据详情
 */
export function useDictDataDetailQuery(
  id: MaybeRef<string>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: queryKeys.dictData.detail(unref(id)),
    queryFn: async () => dictDataService.getDictDataDetail(unref(id)),
    enabled: options?.enabled,
  });
}

/**
 * 添加字典数据
 */
export function useAddDictDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IDictData) => dictDataService.addDictData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictData.lists() });
    },
  });
}

/**
 * 更新字典数据
 */
export function useUpdateDictDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IDictData) => dictDataService.updateDictData(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictData.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dictData.detail(String(variables.id)),
        });
      }
    },
  });
}

/**
 * 删除字典数据
 */
export function useRemoveDictDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => dictDataService.removeDictData(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dictData.lists() });
    },
  });
}
