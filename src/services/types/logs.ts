/**
 * 日志类型定义
 */

export interface ILogs {
  id?: number;
  logType?: string;
  logContent?: string;
  requestParam?: string;
  requestUrl?: string;
  requestMethod?: string;
  requestIp?: string;
  requestIpAddr?: string;
  requestTimeConsume?: string;
  browser?: string;
  os?: string;
  module?: string;
  responseHeader?: string;
  responseBody?: string;
  requestHeader?: string;
  requestBody?: string;
  status: number;
  createTime?: string;
  createBy?: string;
  [prototype: string]: any;
}

export interface ILogsQuery {
  startTime?: string;
  endTime?: string;
  createBy?: string;
  logType?: string;
  module?: string;
  status?: number;
  [prototype: string]: any;
}
