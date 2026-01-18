import type { ILogs, ILogsQuery } from '../types/logs';
import type { IPageResult, IQueryPage } from '../types/types';
import { http } from '@/services/core/http';

/**
 * 日志服务类
 */
class LogsService {
  private static instance: LogsService;

  static getInstance() {
    if (!LogsService.instance) {
      LogsService.instance = new LogsService();
    }
    return LogsService.instance;
  }

  /**
   * 获取日志列表
   * @param query 查询参数
   * @returns 日志列表
   */
  getLogsList(query: ILogsQuery & IQueryPage) {
    return http.get<IPageResult<ILogs>>('/logger/list', {
      params: query,
    });
  }

  /**
   * 获取日志详情
   * @param id 日志ID
   * @returns 日志详情
   */
  getLogsDetail(id: string | number) {
    return http.get<ILogs>(`/logger/detail`, {
      params: { id },
    });
  }
}

export const logsService = LogsService.getInstance();
