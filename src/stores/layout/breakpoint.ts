
/**
 * 响应式断点枚举
 */
export enum BreakpointType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  WIDE = 'wide',
}

/**
 * 断点状态管理
 */
export function useBreakpoint() {
  // ==================== 响应式状态 ====================

  /** 窗口宽度 - 用于响应式断点判断 */
  const windowWidth = ref<number>(window.innerWidth);

  // ==================== 响应式断点状态变量 ====================

  /** 当前断点类型 */
  const currentBreakpoint = ref<BreakpointType>(BreakpointType.DESKTOP);

  /** 是否为移动端 */
  const isMobile = ref<boolean>(false);

  /** 是否为平板端 */
  const isTablet = ref<boolean>(false);

  /** 是否为桌面端 */
  const isDesktop = ref<boolean>(true);

  /** 是否为宽屏桌面端 */
  const isWide = ref<boolean>(false);

  /**
   * 更新断点状态
   */
  const updateBreakpointStates = (width: number): void => {
    let newBreakpoint: BreakpointType;

    if (width < 768) {
      newBreakpoint = BreakpointType.MOBILE;
    }
    else if (width >= 768 && width <= 1023) {
      newBreakpoint = BreakpointType.TABLET;
    }
    else if (width >= 1024 && width <= 1439) {
      newBreakpoint = BreakpointType.DESKTOP;
    }
    else {
      newBreakpoint = BreakpointType.WIDE;
    }

    currentBreakpoint.value = newBreakpoint;
    isMobile.value = newBreakpoint === BreakpointType.MOBILE;
    isTablet.value = newBreakpoint === BreakpointType.TABLET;
    isDesktop.value = newBreakpoint === BreakpointType.DESKTOP;
    isWide.value = newBreakpoint === BreakpointType.WIDE;
  };

  // 监听窗口宽度变化，更新断点状态
  watch(
    windowWidth,
    (newWidth) => {
      updateBreakpointStates(newWidth);
    },
    { immediate: true },
  );

  // ==================== 响应式处理方法 ====================

  /**
   * 防抖处理的窗口大小变化监听
   */
  let resizeTimer: NodeJS.Timeout | null = null;

  /**
   * 监听窗口大小变化并处理断点切换（带防抖优化）
   */
  const handleResize = (): void => {
    // 清除之前的定时器
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    // 防抖处理，避免频繁触发
    resizeTimer = setTimeout(() => {
      const prevBreakpoint = currentBreakpoint.value;

      // 更新窗口宽度
      windowWidth.value = window.innerWidth;
      const newBreakpoint = currentBreakpoint.value;

      // 断点变化已通过 watch 自动更新状态

      resizeTimer = null;
    }, 150); // 150ms 防抖延迟
  };


  return {
    // 基础状态
    windowWidth,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isWide,

    // 方法
    updateBreakpointStates,
    handleResize,
  };
}
