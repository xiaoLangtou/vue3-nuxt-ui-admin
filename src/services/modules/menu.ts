import type { IMenu, MenuOptions } from '../types/menu';
// 获取菜单列表
import http from '@/services/core/http';

/**
 * @description 获取菜单列表
 * @param {object} params 查询参数
 * @param {string} params.name 菜单名称
 * @param {string} params.type 菜单类型
 * @param {number} params.status 菜单状态
 * @param {boolean} params.visible 是否显示
 */
export function getMenuTreeList(params?: { name?: string; type?: string; status?: number; visible?: boolean }) {
  return http.get<MenuOptions[]>('/menu/tree', { params });
}

/**
 * 创建菜单
 * @param {Menu.IMenu} params 菜单参数
 * @param {number} params.parentId 父级菜单ID
 * @param {string} params.name 菜单名称
 * @param {string} params.path 菜单路径
 * @param {string} params.component 菜单组件
 * @param {string} params.icon 菜单图标
 * @param {boolean} params.isKeepAlive 是否缓存
 * @param {boolean} params.isHide 是否隐藏
 * @param {boolean} params.isIframe 是否内嵌页面
 * @param {number} params.menuType 菜单类型
 * @param {string} params.permission 菜单权限
 * @param {number} params.sortOrder 排序
 * @returns
 */
export function createMenu(params: IMenu) {
  return http.post('/menu/create', params);
}

/**
 * @description 更新菜单
 * @param {Menu.IMenu} params
 * @param {number} params.id 菜单ID
 * @param {number} params.parentId 父级菜单ID
 * @param {string} params.name 菜单名称
 * @param {string} params.path 菜单路径
 * @param {string} params.component 菜单组件
 * @param {string} params.icon 菜单图标
 * @param {boolean} params.isKeepAlive 是否缓存
 * @param {boolean} params.isHide 是否隐藏
 * @param {boolean} params.isIframe 是否内嵌页面
 * @param {number} params.menuType 菜单类型
 * @param {string} params.permission 菜单权限
 * @param {number} params.sortOrder 排序
 * @returns
 */
export function updateMenu(params: IMenu) {
  return http.post('/menu/update', params);
}

/**
 * @description 删除菜单
 * @param {number} id 菜单ID
 * @returns
 */
export function deleteMenu(id: number) {
  return http.delete(`/menu/delete/${id}`);
}

/**
 * @description 获取菜单详情
 * @param {number} id 菜单ID
 * @returns
 */
export function getMenuDetail(id: number | undefined) {
  return http.get<IMenu>(`/menu/detail/${id}`);
}

/**
 * @description 批量创建按钮
 * @param {string} menuId 菜单ID
 * @param {any[]} buttons 按钮列表
 * @returns
 */
export function batchCreateButtons(menuId: string, buttons: any[]) {
  return http.post('/menu/buttons/batch', { menuId, buttons });
}

/**
 * @description 批量删除菜单
 * @param {string[]} ids 菜单ID列表
 * @returns
 */
export function batchDeleteMenus(ids: string[]) {
  return http.post('/menu/delete/batch', { ids });
}

/**
 * @description 获取父级菜单选项
 * @param {string} excludeId 排除的菜单ID
 * @returns
 */
export function getParentMenuOptions(excludeId?: string) {
  return http.get<MenuOptions[]>('/menu/tree', { params: { excludeId } });
}

export type MenuCreateParams = IMenu;
export type MenuUpdateParams = IMenu;

// 导出menuApi对象以保持向后兼容
export const menuApi = {
  getMenuTreeList,
  getMenuTree: getMenuTreeList, // Alias for compatibility
  createMenu,
  updateMenu,
  deleteMenu,
  getMenuDetail,
  batchCreateButtons,
  batchDeleteMenus,
  getParentMenuOptions,
};
