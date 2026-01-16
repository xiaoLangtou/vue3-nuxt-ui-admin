import type { LayoutConfig, LayoutState } from '@/types/layout';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { defaultPreferences } from '@/preferences/config.ts';
import { BreakpointType, useBreakpoint } from './layout/breakpoint';
import { useConfig } from './layout/config';
import { useLifecycle } from './layout/lifecycle';
import { SidebarMode, useSidebar } from './layout/sidebar';
import { useTheme } from './layout/theme';

// 导出枚举供外部使用
export { BreakpointType, SidebarMode };

/**
 * 布局状态管理 Store
 *
 * 负责管理整个应用的布局状态，包括：
 * - 响应式断点管理
 * - 侧边栏状态管理
 * - 主题配置管理
 * - 移动端适配
 */
export const useLayoutStore = defineStore(
  'layout',
  () => {
    // ==================== 核心状态定义 ====================

    /** 布局配置 - 主题、颜色、标签页等设置 */
    const layoutConfig = ref<LayoutConfig>(defaultPreferences);

    /** 布局状态 - 菜单激活、抽屉显示等状态 */
    const layoutState = ref<LayoutState>({
      isCollapsed: false,
      configSidebarVisible: false,
      showMobileSidebar: false,
      activeMenuItem: null,
    });

    /** 窗口宽度 - 用于响应式断点判断 */
    const windowWidth = ref<number>(window.innerWidth);

    // ==================== 模块化功能 ====================

    // 断点管理模块
    const breakpointModule = useBreakpoint();

    // 侧边栏管理模块
    const sidebarModule = useSidebar(layoutState, windowWidth);

    // 主题管理模块
    const themeModule = useTheme(layoutConfig);

    // 配置管理模块
    const configModule = useConfig(layoutConfig, layoutState);

    // 生命周期管理模块
    const lifecycleModule = useLifecycle(layoutConfig, layoutState, breakpointModule.currentBreakpoint, breakpointModule.handleResize);

    // ==================== 其他方法 ====================

    /**
     * 切换菜单折叠状态
     */
    const toggleMenu = (): void => {
      if (breakpointModule.isMobile.value || breakpointModule.isTablet.value) {
        // 移动端：切换移动侧边栏显示
        layoutState.value.showMobileSidebar = !layoutState.value.showMobileSidebar;
      } else {
        // 桌面端：如果侧边栏未固定，先设置为固定模式
        if (!sidebarModule.sidebarFixedMode.value) {
          sidebarModule.sidebarFixedMode.value = true;
        }
        // 切换折叠状态
        layoutState.value.isCollapsed = !layoutState.value.isCollapsed;
      }
    };

    /**
     * 关闭移动端侧边栏
     */
    const closeMobileSidebar = (): void => {
      layoutState.value.showMobileSidebar = false;
    };


    // ==================== 返回值 ====================

    return {
      // ==================== 基础状态 ====================
      layoutConfig,
      layoutState,
      windowWidth,
      sidebarHidden: sidebarModule.sidebarHidden,
      sidebarFixedMode: sidebarModule.sidebarFixedMode,

      // ==================== 响应式断点计算属性 ====================
      currentBreakpoint: breakpointModule.currentBreakpoint,
      isMobile: breakpointModule.isMobile,
      isTablet: breakpointModule.isTablet,
      isDesktop: breakpointModule.isDesktop,
      isWide: breakpointModule.isWide,

      // ==================== 侧边栏状态计算属性 ====================
      isCollapsed: sidebarModule.isCollapsed,

      // ==================== 主题状态计算属性 ====================
      isDarkTheme: themeModule.isDarkTheme,
      getPrimary: themeModule.getPrimary,
      getGray: themeModule.getGray,

      // ==================== 标签页和布局配置变量 ====================
      isShowTab: configModule.isShowTab,
      tabStyle: configModule.tabStyle,
      isShowIcon: configModule.isShowIcon,
      isShowHeader: configModule.isShowHeader,
      isShowFooter: configModule.isShowFooter,
      companyName: configModule.companyName,
      companyHomepage: configModule.companyHomepage,
      date: configModule.date,
      icp: configModule.icp,
      icpLink: configModule.icpLink,
      isEnableColorWeak: configModule.isEnableColorWeak,
      isEnableGray: configModule.isEnableGray,

      // ==================== 响应式处理方法 ====================
      handleResize: breakpointModule.handleResize,

      // ==================== 侧边栏状态管理方法 ====================
      toggleSidebarFixedMode: sidebarModule.toggleSidebarFixedMode,
      setSidebarRelativeMode: sidebarModule.setSidebarRelativeMode,
      setSidebarFixedMode: sidebarModule.setSidebarFixedMode,
      toggleMobileSidebar: sidebarModule.toggleMobileSidebar,

      // ==================== 配置抽屉管理方法 ====================
      openConfigDrawer: configModule.openConfigDrawer,
      closeConfigDrawer: configModule.closeConfigDrawer,
      toggleConfigDrawer: configModule.toggleConfigDrawer,

      // ==================== 其他方法 ====================
      initLayout: lifecycleModule.initLayout,
      destroyLayout: lifecycleModule.destroyLayout,
      setActiveMenuItem: lifecycleModule.setActiveMenuItem,
      toggleDarkMode: themeModule.toggleDarkMode,
      toggleMenu,
      closeMobileSidebar,
      setPrimary: themeModule.setPrimary,
      generateConfigString: configModule.generateConfigString,
    };
  },
  {
    persist: {
      key: 'layout-store',
      storage: localStorage,
    },
  },
);
