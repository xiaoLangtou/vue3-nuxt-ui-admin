/**
 * TanStack Query Keys 管理
 * 统一管理所有查询键，避免重复和冲突
 */

export const queryKeys = {
  /**
   * 登录相关
   */
  auth: {
    all: ['auth'],
    userInfo: () => [...queryKeys.auth.all, 'userInfo'],
    menuList: () => [...queryKeys.auth.all, 'menuList'],
    captcha: () => [...queryKeys.auth.all, 'captcha'],
  },

  /**
   * 字典类型相关
   */
  dictType: {
    all: ['dictType'],
    lists: () => [...queryKeys.dictType.all, 'list'],
    list: (query: Record<string, any>) => [...queryKeys.dictType.lists(), query],
    details: () => [...queryKeys.dictType.all, 'detail'],
    detail: (id: string) => [...queryKeys.dictType.details(), id],
  },

  /**
   * 字典数据相关
   */
  dictData: {
    all: ['dictData'],
    lists: () => [...queryKeys.dictData.all, 'list'],
    list: (query: Record<string, any>) => [...queryKeys.dictData.lists(), query],
    details: () => [...queryKeys.dictData.all, 'detail'],
    detail: (id: string) => [...queryKeys.dictData.details(), id],
  },

  /**
   * 菜单相关
   */
  menu: {
    all: ['menu'],
    tree: (name?: string) => [...queryKeys.menu.all, 'tree', name],
    details: () => [...queryKeys.menu.all, 'detail'],
    detail: (id: number) => [...queryKeys.menu.details(), id],
  },
};
