<script setup lang="ts">
import type { MenuOptions } from '@/services/types/menu';

import useMenuStore from '@/stores/menu';
import AppFavoritesMenu from './app-favorites-menu.vue';
import AppMenuItem from './app-menu-item.vue';

// ==================== Props 定义 ====================
interface Props {
  /** 是否折叠状态 */
  collapsed?: boolean;
  /** 是否为移动端 */
  isMobile?: boolean;
  /** 是否启用手风琴模式（同时只能展开一个菜单项） */
  accordion?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  isMobile: false,
  accordion: true,
});

// ==================== 事件定义 ====================
const emit = defineEmits<{
  'menu-item-click': [];
}>();

// ==================== Store 状态管理 ====================
const { menuList } = useMenuStore();

// ==================== 计算属性 ====================
/**
 * 递归过滤树形菜单
 * @param menuItems 菜单项数组
 * @returns 过滤后的菜单项数组
 */
function filterTreeMenu(menuItems: MenuOptions[]): MenuOptions[] {
  return menuItems
    .filter(item => !item.meta.isHide)
    .map(item => ({
      ...item,
      children: item.children ? filterTreeMenu(item.children) : undefined,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** 过滤后的菜单项 */
const filteredMenuItems = computed(() => {
  return filterTreeMenu(menuList);
});

// ==================== 手风琴模式管理 ====================
/** 当前展开的菜单项 ID（手风琴模式下使用） */
const expandedMenuId = ref<string | null>(null);

/**
 * 切换菜单项展开状态
 * @param itemId 菜单项 ID
 * @param currentExpanded 当前展开状态
 * @returns 新的展开状态
 */
function toggleMenuExpand(itemId: string, currentExpanded: boolean): boolean {
  if (!props.accordion) {
    // 非手风琴模式：直接切换
    return !currentExpanded;
  }

  // 手风琴模式：只能展开一个
  if (expandedMenuId.value === itemId) {
    // 如果点击的是当前已展开的菜单，则收起
    expandedMenuId.value = null;
    return false;
  }
  else {
    // 如果点击的是其他菜单，则展开并收起其他
    expandedMenuId.value = itemId;
    return true;
  }
}

/**
 * 检查菜单项是否应该展开
 * @param itemId 菜单项 ID
 * @returns 是否展开
 */
function shouldExpand(itemId: string): boolean {
  if (!props.accordion) {
    // 非手风琴模式：返回 true，由子组件自己管理
    return true;
  }
  // 手风琴模式：只有当前 ID 匹配时才展开
  return expandedMenuId.value === itemId;
}

// 提供给子组件使用
provide('accordion', props.accordion);
provide('toggleMenuExpand', toggleMenuExpand);
provide('shouldExpand', shouldExpand);
provide('expandedMenuId', expandedMenuId);

// ==================== 事件处理方法 ====================
/** 处理菜单项点击事件 */
function handleMenuItemClick(): void {
  emit('menu-item-click');
}
</script>

<template>
  <nav
    class="h-full overflow-y-auto bg-neutral-50 dark:bg-neutral-900 select-none scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent"
    :class="[
      {
        'rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]': props.isMobile,
        'overflow-x-hidden': !props.collapsed,
        'overflow-x-visible': props.collapsed,
      }
    ]"
  >
    <div class="py-2">
      <!-- 收藏菜单 -->
      <AppFavoritesMenu :collapsed="props.collapsed" @menu-item-click="handleMenuItemClick" />

      <!-- 常规菜单 -->
      <AppMenuItem
        v-for="(item, index) in filteredMenuItems" :key="item.id" :collapsed="props.collapsed"
        :index="index" :is-mobile="props.isMobile" :item="item" :level="0"
        @menu-item-click="handleMenuItemClick"
      />
    </div>
  </nav>
</template>

<style scoped>
/*
  Tailwind doesn't have built-in scrollbar styling utilities by default without plugins.
  Keeping minimal custom CSS for scrollbar customization if tailwind-scrollbar is not available.
  If you have a scrollbar plugin, these can be replaced by utility classes.
*/
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  border-radius: 2px;
}
</style>
