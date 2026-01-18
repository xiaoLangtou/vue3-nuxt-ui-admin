import type { ILogs, ILogsQuery } from '../types/logs';
import type { IQueryPage } from '../types/types';
import { useQuery } from '@tanstack/vue-query';
import { logsService } from '../modules/logs';

type MaybeRef<T> = T | { value: T };

/**
 * 获取日志列表
 */
export function useLogsListQuery(
  query: MaybeRef<ILogsQuery & IQueryPage>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: ['logs', 'list', query] as const,
    queryFn: async () => logsService.getLogsList(unref(query)),
    enabled: options?.enabled,
  });
}

/**
 * 获取日志详情
 */
export function useLogsDetailQuery(
  id: MaybeRef<string | number>,
  options?: { enabled?: MaybeRef<boolean> },
) {
  return useQuery({
    queryKey: ['logs', 'detail', id] as const,
    queryFn: async () => logsService.getLogsDetail(unref(id)),
    enabled: options?.enabled,
  });
}
