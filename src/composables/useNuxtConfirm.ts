import ConfirmDialog from '@/components/ConfirmDialog.vue';

export interface ConfirmOptions {
  message?: string;
  title?: string;
  accept?: () => void | Promise<void>;
  reject?: () => void | Promise<void>;
  acceptLabel?: string;
  rejectLabel?: string;
}

// 全局单例 overlay 实例
let modalInstance: any = null;

export function useNuxtConfirm() {
  // 确保只创建一次 overlay 实例
  if (!modalInstance) {
    const overlay = useOverlay();
    modalInstance = overlay.create(ConfirmDialog, {
      destroyOnClose: false, // 改为 false，避免销毁后无法重新打开
    });
  }

  const modal = modalInstance!

  async function showConfirm(options: ConfirmOptions & { color?: string; icon?: string }) {
    const {
      message = '确定要执行此操作吗?',
      title = '确认',
      accept,
      reject,
      ...rest
    } = options;

    console.log(options);

    const result = await modal.open({
      title,
      message,
      ...rest,
    });

    if (result) {
      await Promise.resolve(accept?.());
      return true;
    }
    else {
      await Promise.resolve(reject?.());
      return false;
    }
  }

  const confirmDelete = async (options: ConfirmOptions = {}) => {
    return showConfirm({
      message: '确定要删除吗？此操作无法撤销。',
      title: '删除确认',
      icon: 'i-lucide-trash-2',
      ...options,
    });
  };

  const confirmInfo = async (options: ConfirmOptions = {}) => {
    return showConfirm({
      title: '提示',
      icon: 'i-lucide-info',
      ...options,
    });
  };

  const confirmSuccess = async (options: ConfirmOptions = {}) => {
    return showConfirm({
      title: '成功',
      icon: 'i-lucide-check-circle',
      ...options,
    });
  };

  const confirmWarning = async (options: ConfirmOptions = {}) => {
    return showConfirm({
      title:  '警告',
      icon: 'i-lucide-alert-triangle',
      ...options,
    });
  };

  return {
    confirmDelete,
    confirmInfo,
    confirmSuccess,
    confirmWarning,
    showConfirm,
  };
}
