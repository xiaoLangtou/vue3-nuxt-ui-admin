/**
 * Redis 信息项
 */
export interface IRedisInfoItem {
  /** 描述 */
  description?: string;
  /** 值 */
  value?: string | number | boolean;
}

/**
 * Redis 信息
 */
export interface IRedisInfo {
  /** Redis 版本 */
  redisVersion?: IRedisInfoItem;
  /** 运行天数 */
  uptimeInDays?: IRedisInfoItem;
  /** 客户端连接数 */
  connectedClients?: IRedisInfoItem;
  /** 已使用内存 */
  usedMemoryHuman?: IRedisInfoItem;
  /** 系统总内存 */
  totalSystemMemoryHuman?: IRedisInfoItem;
  /** RDB 加载中 */
  RDBLoading?: IRedisInfoItem;
  /** AOF 是否开启 */
  AOFEnabled?: IRedisInfoItem;
}

/**
 * Redis 命令统计
 */
export interface IRedisCommand {
  /** 命令名称 */
  name?: string;
  /** 标签 */
  label?: string;
  /** 调用次数 */
  value?: number;
}

/**
 * 缓存详情
 */
export interface ICache {
  /** Redis 信息 */
  redisInfo?: IRedisInfo;
  /** Redis 命令统计 */
  redisCommands?: IRedisCommand[];
}
