import type { MenuItem } from '@/types/layout';
import { nextTick } from 'vue';

/**
 * 生命周期管理
 */
export function useLifecycle(layoutConfig: any, layoutState: any, currentBreakpoint: any, handleResize: () => void) {
  // 定时器引用
  let resizeTimer: NodeJS.Timeout | null = null;
  /**
   * 初始化布局系统
   */
  const initLayout = async (): Promise<void> => {
    // 添加窗口大小变化监听器（使用 passive 选项优化性能）
    window.addEventListener('resize', handleResize, { passive: true });

    // 等待 DOM 更新
    await nextTick();
  };

  /**
   * 销毁布局监听器和清理资源
   */
  const destroyLayout = (): void => {
    // 移除事件监听器
    window.removeEventListener('resize', handleResize);

    // 清理定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
  };


  /**
   * 设置激活的菜单项
   * @param item - 菜单项
   */
  const setActiveMenuItem = (item: MenuItem): void => {
    layoutState.value.activeMenuItem = item.value || item;
  };

  return {
    // 方法
    initLayout,
    destroyLayout,
    setActiveMenuItem,
  };
}
