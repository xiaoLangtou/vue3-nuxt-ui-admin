import type { IDictType, IDictTypeQuery } from '../types/dict';
import type { IPageResult, IQueryPage } from '../types/types';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
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
 * 获取字典类型列表(无限滚动)
 */
export function useDictTypeInfiniteQuery(
  query: MaybeRef<IDictTypeQuery>,
  pageSize: number = 15
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.dictType.lists(), 'infinite', unref(query), pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await dictTypeService.getDictList({
        current: pageParam as number,
        size: pageSize,
        dictName: unref(query).dictName,
        ...unref(query),
      });
      // 兼容后端字段：后端返回 page, 前端统一用 pager
      return {
        records: res.records,
        pager: (res as any).pager ?? (res as any).page,
      } as IPageResult<IDictType>;
    },
    getNextPageParam: (lastPage: IPageResult<IDictType>) => {
      const current = Number(lastPage?.pager?.current);
      const totalPage = Number(lastPage?.pager?.totalPage);
      if (current < totalPage) {
        return current + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
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
