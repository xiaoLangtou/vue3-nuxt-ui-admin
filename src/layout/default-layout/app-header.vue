<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import AppTopbar from '../shared/app-topbar.vue';
import AppBreadcrumb from './app-breadcrumb.vue';

const layoutStore = useLayoutStore();

function toggleSidebar() {
  if (layoutStore.isMobile || layoutStore.isTablet) {
    // 移动端：切换移动侧边栏
    layoutStore.toggleMobileSidebar();
  } else {
    // 桌面端：切换折叠状态
    layoutStore.toggleMenu();
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 flex items-center justify-between h-18 px-4 border-b border-gray-100/80 dark:border-gray-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm transition-all duration-300 text-base">
    <!-- 左侧区域 -->
    <div class="flex items-center gap-3">
      <!-- 移动端汉堡菜单 -->
      <UButton
        icon="i-lucide-menu"
        color="gray"
        variant="ghost"
        square
        class="lg:hidden"
        @click="toggleSidebar"
      />

      <!-- 桌面端折叠按钮 -->
      <UTooltip :text="layoutStore.layoutState.isCollapsed ? '展开菜单' : '折叠菜单'" :popper="{ placement: 'bottom' }">
        <UButton
          :icon="layoutStore.layoutState.isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
          color="gray"
          variant="ghost"
          square
          class="hidden lg:flex text-gray-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          @click="toggleSidebar"
        />
      </UTooltip>

      <!-- 面包屑 -->
      <AppBreadcrumb v-if="!layoutStore.isMobile" class="hidden sm:flex ml-1" />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-3">
      <AppTopbar />
    </div>
  </header>
</template>
