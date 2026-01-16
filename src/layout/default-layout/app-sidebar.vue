<script lang="ts" setup>
import { useLayoutStore } from '@/stores/layout';
import { Pin, PinOff } from 'lucide-vue-next';
import { DEBOUNCE_DELAYS } from '../constants';
import { AppHeaderLogo, AppMenu, AppMenuSearch, AppUserMenu } from '../shared';

// ==================== Store 状态管理 ====================
const layoutStore = useLayoutStore();

// ==================== 本地状态管理 ====================
/** 控制侧边栏是否自动隐藏 */
const shouldAutoHide = ref<boolean>(false);
/** 隐藏定时器 */
let hideTimer: NodeJS.Timeout | null = null;
/** 控制搜索对话框显示 */
const showSearch = ref<boolean>(false);

// ==================== 事件处理方法 ====================
const handleMenuItemClick = (): void => {
    if (layoutStore.isMobile || layoutStore.isTablet) {
        layoutStore.closeMobileSidebar();
    }
};

const openSearch = (): void => {
    showSearch.value = true;
};

const closeSearch = (): void => {
    showSearch.value = false;
};

const handleKeydown = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
    }
};

const toggleFixedMode = (): void => {
    layoutStore.toggleSidebarFixedMode();
    clearAutoHideTimer();
    shouldAutoHide.value = false;
};

const clearAutoHideTimer = (): void => {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
};

const handleMouseEnter = (): void => {
    if (!layoutStore.sidebarFixedMode) {
        clearAutoHideTimer();
        shouldAutoHide.value = false;
    }
};

const handleMouseLeave = (): void => {
    if (!layoutStore.sidebarFixedMode) {
        clearAutoHideTimer();
        hideTimer = setTimeout(() => {
            shouldAutoHide.value = true;
            hideTimer = null;
        }, DEBOUNCE_DELAYS.SIDEBAR_AUTO_HIDE);
    }
};

const setRelativeMode = (): void => {
    layoutStore.setSidebarRelativeMode();
    shouldAutoHide.value = false;
    clearAutoHideTimer();
};

// ==================== 计算属性 ====================
/** 是否为移动端 */
const isMobile = computed(() => layoutStore.isMobile);

/** 侧边栏是否折叠 */
const isCollapsed = computed(() => layoutStore.layoutState.isCollapsed);

/** 是否为桌面端（桌面或宽屏） */
const isDesktopOrWide = computed(() => layoutStore.isDesktop || layoutStore.isWide);

/** 是否为移动端（移动或平板） */
const isMobileOrTablet = computed(() => layoutStore.isMobile || layoutStore.isTablet);

/** 侧边栏 class 列表 */
const sidebarClasses = computed(() => ({
    // 设备类型
    'app-sidebar--mobile': isMobileOrTablet.value,
    'app-sidebar--desktop': isDesktopOrWide.value,

    // 模式样式
    'app-sidebar--fixed-mode': isDesktopOrWide.value && layoutStore.sidebarFixedMode,
    'app-sidebar--relative-mode': isDesktopOrWide.value && !layoutStore.sidebarFixedMode,

    // 折叠状态
    'app-sidebar--collapsed': isDesktopOrWide.value && layoutStore.isCollapsed,
    'app-sidebar--expanded': isDesktopOrWide.value && !layoutStore.isCollapsed,

    // Fixed 模式特殊样式
    'app-sidebar--hover-hidden': isDesktopOrWide.value && layoutStore.sidebarFixedMode,
    'sidebar-auto-hide': isDesktopOrWide.value && layoutStore.sidebarFixedMode && (shouldAutoHide.value || layoutStore.sidebarHidden),

    // Relative 模式隐藏样式
    'app-sidebar--hidden': isDesktopOrWide.value && !layoutStore.sidebarFixedMode && layoutStore.sidebarHidden
}));

// ==================== 响应式监听 ====================
/** 监听移动端状态变化 */
watch(
    isMobileOrTablet,
    (isMobile: boolean) => {
        if (isMobile) {
            setRelativeMode();
        }
    },
    { immediate: true }
);

// ==================== 生命周期管理 ====================
/**
 * 组件挂载时添加快捷键监听
 */
onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

/**
 * 组件卸载时清理定时器和监听器
 */
onUnmounted(() => {
    clearAutoHideTimer();
    document.removeEventListener('keydown', handleKeydown);
});

// ==================== 组件暴露 ====================
defineExpose({
    /** 获取当前是否为 Fixed 模式 */
    get isFixedMode(): boolean {
        return layoutStore.sidebarFixedMode;
    },
    /** 设置为 Relative 模式 */
    setRelativeMode
});
</script>

<template>
    <aside v-bind="$attrs"
        class="group relative flex flex-col h-full bg-white dark:bg-neutral-900 transition-all duration-300 ease-in-out z-50"
        :class="[
            isCollapsed ? 'w-[68px]' : 'w-64',
            isMobile
                ? 'fixed inset-y-2 left-2 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 h-[calc(100vh-1rem)]'
                : 'relative',
            isMobile && !layoutStore.layoutState.showMobileSidebar ? '-translate-x-[calc(100%_+_1rem)]' : 'translate-x-0',
            !isMobile && !layoutStore.sidebarFixedMode && shouldAutoHide ? '-ml-64 absolute h-full shadow-xl' : '',
            !isMobile && !layoutStore.sidebarFixedMode && !shouldAutoHide ? 'absolute left-0 h-full shadow-xl' : ''
        ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <!-- 头部 Logo -->
        <div
            class="flex items-center justify-center h-18 px-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 overflow-hidden relative">
            <div class="relative z-10 w-full">
                <transition enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95" mode="out-in">
                    <!-- 展开状态 -->
                    <div v-if="!isCollapsed" key="expanded" class="flex items-center justify-between w-full">
                        <AppHeaderLogo />

                        <!-- 固定模式切换按钮 -->
                        <UTooltip :text="layoutStore.sidebarFixedMode ? '取消固定' : '固定侧边栏'"
                            :popper="{ placement: 'right' }">
                            <UButton color="gray" variant="ghost" size="xs" square
                                @click="layoutStore.toggleSidebarFixedMode">
                                <Pin v-if="!layoutStore.sidebarFixedMode" :size="16" />
                                <PinOff v-else :size="16" />
                            </UButton>
                        </UTooltip>
                    </div>

                    <!-- 折叠状态 -->
                    <div v-else key="collapsed" class="flex items-center justify-center w-full">
                        <AppHeaderLogo :collapsed="true" />
                    </div>
                </transition>
            </div>
        </div>

        <!-- 侧边栏内容 -->
        <div class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden  gap-1.5">
            <!-- 搜索按钮 -->

            <div class="px-2 pt-2">
                <UTooltip text="搜索 (Cmd+K)" :prevent="!isCollapsed" :popper="{ placement: 'right' }">
                    <UButton :icon="isCollapsed ? 'i-lucide-search' : undefined" color="gray" variant="ghost"
                        :block="!isCollapsed" :square="isCollapsed"
                        class="justify-start w-full bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800"
                        :class="[isCollapsed ? 'justify-center' : '']" :ui="{ rounded: 'rounded-lg' }" @click="openSearch">
                        <template v-if="!isCollapsed">
                            <UIcon name="i-lucide-search" class="w-4 h-4 mr-2 text-gray-400" />
                            <span class="flex-1 text-left text-sm font-normal">搜索...</span>
                            <div class="flex items-center gap-0.5 ml-auto">
                                <UKbd value="meta" size="xs"
                                    class="bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700 text-gray-400" />
                                <UKbd value="k" size="xs"
                                    class="bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-700 text-gray-400" />
                            </div>
                        </template>
                    </UButton>
                </UTooltip>
            </div>

            <!-- 菜单 -->
            <AppMenu :collapsed="isCollapsed" :is-mobile="isMobile" @menu-item-click="handleMenuItemClick" />
        </div>

        <!-- 底部用户菜单 -->
        <div class="p-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <AppUserMenu :collapsed="isCollapsed" />
        </div>
    </aside>

    <!-- 移动端遮罩 -->
    <div v-if="isMobile && layoutStore.layoutState.showMobileSidebar"
        class="fixed inset-0 bg-neutral-900/50 z-40 transition-opacity backdrop-blur-sm"
        @click="layoutStore.closeMobileSidebar" />

    <!-- 搜索对话框 -->
    <AppMenuSearch v-model:visible="showSearch" @menu-item-click="handleMenuItemClick" />
</template>

<style scoped>
/* 确保侧边栏在移动端层级正确 */
aside {
    z-index: 50;
}
</style>
