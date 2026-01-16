import type { Ref } from 'vue';
import type { LayoutState } from '@/types/layout';
import { ref, watch } from 'vue';

/**
 * 侧边栏模式枚举
 */
export enum SidebarMode {
  RELATIVE = 'relative',
  FIXED = 'fixed',
}

/**
 * 侧边栏状态管理
 * @param layoutState - 布局状态引用
 * @param windowWidth - 窗口宽度引用
 */
export function useSidebar(layoutState: Ref<LayoutState>, windowWidth: Ref<number>) {
  // ==================== 侧边栏状态 ====================

  /** 移动端侧边栏显示状态 */
  const showMobileSidebar = ref<boolean>(false);

  /** 侧边栏完全隐藏状态 */
  const sidebarHidden = ref<boolean>(false);

  /** 侧边栏模式状态 - Fixed 或 Relative */
  const sidebarFixedMode = ref<boolean>(false);

  // ==================== 侧边栏状态变量 ====================

  /** 侧边栏是否折叠 */
  const isCollapsed = ref<boolean>(false);

  /**
   * 更新侧边栏折叠状态
   */
  const updateSidebarStates = (): void => {
    const width = windowWidth.value;
    if (width < 1024) {
      // 移动端：不折叠
      isCollapsed.value = false;
    } else {
      // 桌面端：同步 layoutState 的折叠状态
      isCollapsed.value = layoutState.value.isCollapsed;
    }
  };

  // 监听相关状态变化，更新侧边栏状态
  watch(
    [windowWidth, sidebarFixedMode, showMobileSidebar, sidebarHidden, () => layoutState.value.isCollapsed],
    () => {
      updateSidebarStates();
    },
    { immediate: true },
  );

  // ==================== 侧边栏状态管理方法 ====================

  /**
   * 切换侧边栏 Fixed 模式
   */
  const toggleSidebarFixedMode = () => {
    sidebarFixedMode.value = !sidebarFixedMode.value;
  };

  /**
   * 设置侧边栏为 Relative 模式
   */
  const setSidebarRelativeMode = () => {
    sidebarFixedMode.value = false;
  };

  /**
   * 设置侧边栏为 Fixed 模式
   */
  const setSidebarFixedMode = () => {
    sidebarFixedMode.value = true;
  };

  /**
   * 切换移动端侧边栏显示状态
   */
  const toggleMobileSidebar = () => {
    showMobileSidebar.value = !showMobileSidebar.value;
  };


  return {
    // 基础状态
    showMobileSidebar,
    sidebarHidden,
    sidebarFixedMode,
    isCollapsed,

    // 方法
    updateSidebarStates,
    toggleSidebarFixedMode,
    setSidebarRelativeMode,
    setSidebarFixedMode,
    toggleMobileSidebar,
  };
}
