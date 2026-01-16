/**
 * Toast 服务 - 基于 Nuxt UI 的 useToast composable
 */

let toastInstance: ReturnType<typeof useToast> | null = null;

/**
 * 获取 toast 实例
 */
function getToastInstance() {
  if (!toastInstance) {
    toastInstance = useToast();
  }
  return toastInstance;
}

/**
 * 颜色映射
 */
const colorMap = {
  success: 'success',
  info: 'primary',
  warn: 'warning',
  error: 'error',
} as const;

/**
 * 图标映射
 */
const iconMap = {
  success: 'i-lucide-check-circle',
  info: 'i-lucide-info',
  warn: 'i-lucide-alert-triangle',
  error: 'i-lucide-circle-x',
} as const;

/**
 * 全局 Toast 服务
 */
export class GlobalToastService {
  /**
   * 显示成功消息
   * @param detail 消息内容
   * @param summary 消息标题
   * @param duration 持续时间(毫秒)
   */
  success(detail: string, summary: string = '成功', duration?: number): void {
    const toast = getToastInstance();
    toast.add({
      title: summary,
      description: detail,
      color: colorMap.success,
      icon: iconMap.success,
      duration: duration || 3000,
    });
  }

  /**
   * 显示信息消息
   * @param detail 消息内容
   * @param summary 消息标题
   * @param duration 持续时间(毫秒)
   */
  info(detail: string, summary: string = '提示', duration?: number): void {
    const toast = getToastInstance();
    toast.add({
      title: summary,
      description: detail,
      color: colorMap.info,
      icon: iconMap.info,
      duration: duration || 3000,
    });
  }

  /**
   * 显示警告消息
   * @param detail 消息内容
   * @param summary 消息标题
   * @param duration 持续时间(毫秒)
   */
  warn(detail: string, summary: string = '警告', duration?: number): void {
    const toast = getToastInstance();
    toast.add({
      title: summary,
      description: detail,
      color: colorMap.warn,
      icon: iconMap.warn,
      duration: duration || 4000,
    });
  }

  /**
   * 显示错误消息
   * @param detail 消息内容
   * @param summary 消息标题
   * @param duration 持续时间(毫秒)
   */
  error(detail: string, summary: string = '错误', duration?: number): void {
    const toast = getToastInstance();
    toast.add({
      title: summary,
      description: detail,
      color: colorMap.error,
      icon: iconMap.error,
      duration: duration || 5000,
    });
  }

  /**
   * 清空所有 Toast 消息
   */
  clear(): void {
    const toast = getToastInstance();
    toast.clear();
  }
}

// 创建全局单例实例
export const globalToast = new GlobalToastService();

// 导出默认实例
export default globalToast;
