import type { ICache } from '../types/cache';
import http from '../core/http';

/**
 * 获取缓存详情
 * @returns 缓存详情数据
 */
export function getCacheDetail(): Promise<ICache> {
  return http.get<ICache>('/redis-cache/info');
}
