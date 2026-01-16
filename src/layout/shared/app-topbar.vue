<script lang="ts" setup>
import { useColorMode } from '@vueuse/core';
import { NotificationDrawer } from '@/components';
import { useAuthStore } from '@/stores';
import { useLayoutStore } from '@/stores/layout';
// ==================== Store 状态管理 ====================
const layoutStore = useLayoutStore();
const { openConfigDrawer } = layoutStore;
const authStore = useAuthStore();

/** 用户角色显示 */
const userRole = computed(() => {
  const roles = authStore.userInfo?.roles;
  if (!roles || !roles.length) return '普通用户';
  // 处理角色可能是对象或字符串的情况
  const first = roles[0];
  if (typeof first === 'string') return roles.join(' ');
  // @ts-ignore - 忽略类型检查，兼容运行时数据
  return roles.map((r: any) => r.name).join(' ');
});

/** 用户下拉菜单项 */
const userDropdownItems = computed(() => [
  [{
    label: '退出登录',
    icon: 'i-lucide-log-out',
    onSelect: () => {
      authStore.logoutAction();
    },
  }],
]);

// ==================== 本地状态管理 ====================
const colorMode = useColorMode();
const isDarkTheme = computed(() => colorMode.value === 'dark');

function toggleDarkMode() {
  colorMode.value = isDarkTheme.value ? 'light' : 'dark';
}

/** 用户资料抽屉显示状态 */
const profileDrawerVisible = ref<boolean>(false);
/** 移动端菜单面板显示状态 */
const mobileMenuVisible = ref<boolean>(false);
/** 消息通知抽屉显示状态 */
const notificationDrawerVisible = ref<boolean>(false);

// ==================== 消息通知数据 ====================
/** 消息通知列表 */
const notifications = ref([
  {
    id: 1,
    title: '系统更新通知',
    message: '系统将于今晚 22:00 进行维护更新，预计耗时 2 小时',
    time: '2 分钟前',
    type: 'system',
    isRead: false,
    avatar: null,
  },
  {
    id: 2,
    title: '新消息',
    message: '张三给您发送了一条新消息',
    time: '5 分钟前',
    type: 'message',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  },
  {
    id: 3,
    title: '任务提醒',
    message: '您有一个任务即将到期，请及时处理',
    time: '1 小时前',
    type: 'task',
    isRead: true,
    avatar: null,
  },
  {
    id: 4,
    title: '审批通知',
    message: '您的请假申请已通过审批',
    time: '2 小时前',
    type: 'approval',
    isRead: false,
    avatar: null,
  },
  {
    id: 5,
    title: '会议提醒',
    message: '项目评审会议将于明天上午 10:00 开始122',
    time: '3 小时前',
    type: 'meeting',
    isRead: true,
    avatar: null,
  },
]);

/** 未读消息数量 */
const unreadCount = computed(() => {
  return notifications.value.filter((n: any) => !n.isRead).length;
});

// ==================== 事件处理方法 ====================
const avatarProps = computed(() => {
  const props: Record<string, any> = {};
  if (authStore.userInfo?.headPic) {
    props.image = authStore.userInfo?.headPic;
  }
  else {
    props.icon = 'pi pi-user';
  }
  return props;
});

/**
 * 打开用户资料抽屉
 */
function openProfileDrawer(): void {
  profileDrawerVisible.value = true;
}

/**
 * 切换移动端菜单面板
 */
function toggleMobileMenu(): void {
  mobileMenuVisible.value = !mobileMenuVisible.value;
}

/**
 * 打开消息通知抽屉
 */
function openNotificationDrawer(): void {
  notificationDrawerVisible.value = true;
}

/**
 * 标记消息为已读
 */
function markAsRead(notificationId: number): void {
  const notification = notifications.value.find((n: any) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
}

/**
 * 标记所有消息为已读
 */
function markAllAsRead(): void {
  notifications.value.forEach((n: any) => (n.isRead = true));
}

/**
 * 删除消息
 */
function deleteNotification(notificationId: number): void {
  const index = notifications.value.findIndex((n: any) => n.id === notificationId);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
}

/**
 * 清空所有消息
 */
function clearAllNotifications(): void {
  notifications.value = [];
}

/**
 * 查看所有消息
 */
function viewAllMessages(): void {
  // 这里可以跳转到消息中心页面或执行其他操作
  console.log('查看所有消息');
  // 示例：关闭抽屉并跳转到消息页面
  notificationDrawerVisible.value = false;
  // router.push('/messages'); // 如果有路由的话
}

/**
 * 获取消息类型图标
 */
function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    system: 'pi pi-cog',
    message: 'pi pi-envelope',
    task: 'pi pi-calendar',
    approval: 'pi pi-check-circle',
    meeting: 'pi pi-users',
  };
  return iconMap[type] || 'pi pi-info-circle';
}

/**
 * 获取消息类型颜色
 */
function getNotificationColor(type: string): string {
  const colorMap: Record<string, string> = {
    system: 'text-blue-500',
    message: 'text-green-500',
    task: 'text-orange-500',
    approval: 'text-purple-500',
    meeting: 'text-cyan-500',
  };
  return colorMap[type] || 'text-gray-500';
}
</script>

<template>
  <div
    class="layout-topbar" :class="[
      {
        'mobile-topbar': layoutStore.isMobile,
        'desktop-topbar': !layoutStore.isMobile,
      },
    ]"
  >
    <div class="layout-topbar-actions">
      <!-- 移动端布局 -->
      <template v-if="layoutStore.isMobile">
        <!-- 主题切换按钮 -->
        <button class="layout-topbar-action" type="button" @click="toggleDarkMode">
          <i class="pi" :class="[{ 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
        </button>

        <!-- 移动端更多菜单 -->
        <button aria-label="更多选项" class="layout-topbar-action" type="button" @click="toggleMobileMenu">
          <i class="pi pi-ellipsis-v" />
        </button>

        <!-- 移动端菜单面板 -->
        <UModal v-model="mobileMenuVisible">
          <UCard>
            <div class="mobile-menu-content space-y-2">
              <UButton
                variant="ghost"
                block
                class="justify-start"
                @click="openProfileDrawer(); mobileMenuVisible = false"
              >
                <template #leading>
                  <UIcon name="i-lucide-calendar" />
                </template>
                Calendar
              </UButton>
              <UButton
                variant="ghost"
                block
                class="justify-start"
                @click="mobileMenuVisible = false"
              >
                <template #leading>
                  <UIcon name="i-lucide-inbox" />
                </template>
                Messages
              </UButton>
              <UButton
                variant="ghost"
                block
                class="justify-start"
                @click="openProfileDrawer(); mobileMenuVisible = false"
              >
                <template #leading>
                  <UIcon name="i-lucide-user" />
                </template>
                Profile
              </UButton>
              <div class="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />
              <UButton
                variant="ghost"
                block
                class="justify-start"
                @click="openConfigDrawer(); mobileMenuVisible = false"
              >
                <template #leading>
                  <UIcon name="i-lucide-palette" />
                </template>
                主题配置
              </UButton>
            </div>
          </UCard>
        </UModal>
      </template>

      <!-- 桌面端布局 -->
      <template v-else>
        <div class="flex items-center gap-2">
          <UTooltip :text="isDarkTheme ? '切换亮色模式' : '切换暗黑模式'" :popper="{ placement: 'bottom' }">
            <UButton
              :icon="isDarkTheme ? 'i-lucide-moon' : 'i-lucide-sun'"
              color="neutral"
              variant="ghost"
              square
              @click="toggleDarkMode"
            />
          </UTooltip>

          <UTooltip text="主题配置" :popper="{ placement: 'bottom' }">
            <UButton
              icon="i-lucide-swatch-book"
              color="neutral"
              variant="ghost"
              square
              @click="openConfigDrawer"
            />
          </UTooltip>

          <UTooltip text="日历" :popper="{ placement: 'bottom' }">
            <UButton
              icon="i-lucide-calendar-days"
              color="neutral"
              variant="ghost"
              square
              class="hidden lg:flex"
              @click="openProfileDrawer"
            />
          </UTooltip>

          <UTooltip text="站内信" :popper="{ placement: 'bottom' }">
            <UChip :show="unreadCount > 0" color="red" position="top-right" inset>
              <UButton
                icon="i-lucide-bell"
                color="neutral"
                variant="ghost"
                square
                class="hidden lg:flex"
                @click="openNotificationDrawer"
              />
            </UChip>
          </UTooltip>

          <UDropdownMenu :items="userDropdownItems" :popper="{ placement: 'bottom-end' }">
            <UUser
              :name="authStore.userInfo?.username"
              :description="userRole"
              :avatar="{ src: authStore.userInfo?.headPic, alt: authStore.userInfo?.username, icon: 'i-lucide-user' }"
              class="hidden lg:flex ml-2 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 py-1"
            />
          </UDropdownMenu>
        </div>
      </template>
    </div>
  </div>

  <!-- 极简消息通知抽屉 -->
    <NotificationDrawer v-model:visible="notificationDrawerVisible" :notifications="notifications" @delete="deleteNotification" @mark-read="markAsRead" @mark-all-read="markAllAsRead" @clear-all="clearAllNotifications" @view-all="viewAllMessages" />
</template>

<style lang="scss" scoped>
.bell-animation {
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>
