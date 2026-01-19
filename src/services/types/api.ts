import type { HTTP_METHOD } from '@/global/enums';
import type { IPageResult, IQueryPage } from './types';

/**
 * API 接口
 */
export interface IApi {
  /** ID */
  id?: number;
  /** 路径 */
  path?: string;
  /** 描述 */
  description?: string;
  /** 请求方法 */
  method?: HTTP_METHOD;
  /** API 分组 */
  apiGroup?: string;
  /** 标签 */
  tags?: string;
  /** 是否忽略 */
  ignore?: number;

  [key: string]: any;
}

/**
 * API 分组
 */
export interface IApiGroup {
  /** API 分组名称 */
  apiGroup?: string;

  [key: string]: any;
}

/**
 * API 同步结果
 */
export interface IApiSync {
  /** 新增的 API */
  newApis: IApi[];
  /** 删除的 API */
  deleteApis: IApi[];
  /** 忽略的 API */
  ignoreApis: IApi[];
  /** API 分组列表 */
  apiGroups: string[];
}

/**
 * API 查询参数
 */
export interface IApiParams extends IQueryPage {
  /** 路径 */
  path?: string;
  /** 请求方法 */
  method?: HTTP_METHOD;
  /** 标签 */
  tags?: string;
  /** 描述 */
  description?: string;

  [key: string]: any;
}
