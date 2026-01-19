import type { IApi, IApiGroup, IApiParams, IApiSync } from '../types/api';
import type { IPageResult } from '../types/types';
import http from '../core/http';

/**
 * 获取 API 列表
 * @param params 查询参数
 * @returns API 列表数据
 */
export function getApiList(params?: IApiParams): Promise<IPageResult<IApi[]>> {
  return http.get<IPageResult<IApi[]>>('/api/list', { params });
}

/**
 * 获取 API 详情
 * @param id API ID
 * @returns API 详情数据
 */
export function getApiDetail(id: number): Promise<IApi> {
  return http.get<IApi>(`/api/detail/${id}`);
}

/**
 * 新增 API
 * @param data API 数据
 * @returns 新增结果
 */
export function addApi(data: IApi): Promise<void> {
  return http.post<void>('/api/add', data);
}

/**
 * 编辑 API
 * @param data API 数据
 * @returns 编辑结果
 */
export function editApi(data: IApi): Promise<void> {
  return http.post<void>('/api/edit', data);
}

/**
 * 删除 API
 * @param id API ID
 * @returns 删除结果
 */
export function deleteApi(id: number): Promise<void> {
  return http.delete<void>(`/api/remove/${id}`);
}

/**
 * 获取 API 分组列表
 * @returns API 分组列表
 */
export function getApiGroup(): Promise<IApiGroup[]> {
  return http.get<IApiGroup[]>('/api/group');
}

/**
 * 同步 API 列表
 * @returns 同步结果
 */
export function syncApi(): Promise<IApiSync> {
  return http.get<IApiSync>('/api/synchronous');
}

/**
 * 更新 API 缓存
 * @returns 更新结果
 */
export function updateApiCache(): Promise<void> {
  return http.get<void>('/api/freshCasbin');
}

/**
 * 忽略 API
 * @param data API 数据
 * @returns 忽略结果
 */
export function ignoreApi(data: IApi): Promise<void> {
  return http.post<void>('/api/ignore', data);
}

/**
 * 批量创建 API
 * @param data API 数据列表
 * @returns 批量创建结果
 */
export function batchCreateApi(data: IApi[]): Promise<void> {
  return http.post<void>('/api/batch-apis', data);
}

/**
 * 获取所有 API
 * @returns 所有 API 列表
 */
export function getAllApis(): Promise<IPageResult<IApi[]>> {
  return http.get<IPageResult<IApi[]>>('/api/all');
}
