/**
 * 菜单类型枚举
 */
export enum MenuType {
  /** 目录 */
  DIRECTORY = 0,
  /** 菜单 */
  MENU = 1,
}

/**
 * 菜单状态枚举
 */
export enum MenuStatus {
  /** 启用 */
  ENABLED = 1,
  /** 禁用 */
  DISABLED = 0,
}

/**
 * 菜单显示状态枚举
 */
export enum MenuState {
  /** 激活 */
  ACTIVE = 'active',
  /** 未激活 */
  INACTIVE = 'inactive',
  /** 隐藏 */
  HIDDEN = 'hidden',
}

/**
 * 路由元信息接口
 */
export interface RouteMeta {
  /** 页面缓存 */
  keepAlive?: boolean;
  /** 是否需要认证 */
  requiresAuth?: boolean;
  /** 允许访问的角色 */
  roles?: string[];
  /** 页面标题(用于面包屑/标签页) */
  title?: string;
  /** 是否在菜单中隐藏 */
  hidden?: boolean;
  /** 是否固定在标签页 */
  affix?: boolean;
  /** 面包屑是否显示 */
  breadcrumb?: boolean;
}

/**
 * 菜单基础信息
 */
export interface MenuBase {
  /** 菜单ID */
  id?: string;
  /** 菜单类型 */
  type: MenuType;
  /** 父级菜单ID */
  parentId?: string | number;
  /** 菜单名称 */
  name: string;
  /** 路由路径 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 组件名称(用于keep-alive) */
  componentName?: string;
  /** 权限标识 */
  permission?: string;
  /** 菜单图标 */
  icon?: string;
  /** 排序 */
  sort: number;
  /** 是否缓存 */
  isKeepAlive?: string;
  /** 是否隐藏 */
  isHide?: string;
  /** 是否外链 */
  isIframe?: string;
  /** 按钮列表 */
  buttons?: Array<{
    name: string;
    permission: string;
  }>;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 菜单树节点
 */
export interface MenuTreeNode extends MenuBase {
  /** 节点唯一标识（用于TreeSelect组件） */
  key: string;
  /** 子菜单 */
  children?: MenuTreeNode[];
  /** 层级深度 */
  level?: number;
  /** 是否展开 */
  expanded?: boolean;
  /** 是否选中 */
  selected?: boolean;
}

/**
 * 按钮配置接口
 */
export interface ButtonConfig {
  /** 按钮ID */
  id: string | number;
  /** 按钮名称 */
  name: string;
  /** 权限标识 */
  permission: string;
  /** 图标类名 */
  icon: string;
  /** 排序值 */
  sort: number;
}

/**
 * 菜单表单数据
 */
export interface MenuFormData {
  /** 菜单ID（编辑时使用） */
  id?: string;
  /** 菜单类型 */
  type: MenuType;
  /** 父级菜单ID */
  parentId?: string | number;
  /** 菜单名称 */
  name: string;
  /** 路由路径 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 组件名称（用于keep-alive） */
  componentName?: string;
  /** 权限标识 */
  permission?: string;
  /** 菜单图标 */
  icon?: string;
  /** 排序 */
  sort: number;
  /** 是否缓存 */
  isKeepAlive?: string;
  /** 是否隐藏 */
  isHide?: string;
  /** 是否外链 */
  isIframe?: string;
  /** 按钮列表 */
  buttons?: Array<{
    name: string;
    permission: string;
  }>;
}

/**
 * 菜单查询参数
 */
export interface MenuQueryParams {
  /** 菜单名称 */
  name?: string;
  /** 菜单类型 */
  type?: MenuType;
  /** 状态 */
  status?: MenuStatus;
  /** 是否显示 */
  visible?: boolean;
}

/**
 * 菜单操作类型
 */
export enum MenuAction {
  /** 新增 */
  CREATE = 'create',
  /** 编辑 */
  EDIT = 'edit',
  /** 查看 */
  VIEW = 'view',
}

/**
 * 菜单拖拽数据
 */
export interface MenuDragData {
  /** 拖拽的菜单ID */
  dragId: string;
  /** 目标菜单ID */
  targetId: string;
  /** 拖拽类型：before, after, inner */
  dropType: 'before' | 'after' | 'inner';
}

/**
 * 菜单导出格式
 */
export interface MenuExportData {
  /** 菜单列表 */
  menus: MenuTreeNode[];
  /** 导出时间 */
  exportTime: string;
  /** 版本 */
  version: string;
}

/**
 * 菜单导入结果
 */
export interface MenuImportResult {
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failureCount: number;
  /** 错误信息 */
  errors: string[];
}
