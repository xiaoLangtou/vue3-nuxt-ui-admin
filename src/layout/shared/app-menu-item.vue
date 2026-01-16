<script lang="ts" setup>
import type { MenuOptions } from '@/services/types/menu';
import { useMouseInElement } from '@vueuse/core';
import { ChevronRight, ExternalLink, Star } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useLucideIcon } from '@/composables';
import { useFavoritesStore } from '@/stores/favorites';
import { useFloatingMenu } from '../composables/useFloatingMenu';

interface Props {
  item: MenuOptions;
  index?: number;
  collapsed?: boolean;
  level?: number;
  isMobile?: boolean;
  parentItemKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  collapsed: false,
  level: 0,
  isMobile: false,
  parentItemKey: undefined,
});

const emit = defineEmits<{
  'menu-item-click': [];
}>();

const router = useRouter();
const floatingMenu = ref<HTMLElement | null>(null);
const favoritesStore = useFavoritesStore();

const menuId = `menu-${props.item.id}-${props.index}`;
const { isActive: showFloating, register } = useFloatingMenu(menuId);

// 注入手风琴模式相关方法
const accordion = inject<boolean>('accordion', false);
const toggleMenuExpand = inject<(itemId: string, currentExpanded: boolean) => boolean>('toggleMenuExpand', () => true);
const expandedMenuId = inject<{ value: string | null }>('expandedMenuId', { value: null });

const isExpanded = ref(false);

// 计算实际展开状态（考虑手风琴模式）
const actualExpanded = computed(() => {
  // 只有顶级菜单才受手风琴模式控制
  if (props.level === 0 && accordion) {
    return expandedMenuId.value === props.item.id;
  }
  // 子菜单或非手风琴模式，使用本地状态
  return isExpanded.value;
});

const hasChildren = computed(() => props.item.children && props.item.children.length > 0);
const isCurrentRoute = computed(() => props.item.path && router.currentRoute.value.path === props.item.path);
const shouldUseFloatingMenu = computed(() => props.collapsed && hasChildren.value);
const sortedChildren = computed(() => {
  if (!props.item.children)
    return [];
  return [...props.item.children].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
});

/**
 * 判断是否为外链菜单项
 * 条件：没有子菜单且有url属性
 */
const isExternalLink = computed(() => {
  return !hasChildren.value && props.item.url;
});

/**
 * 是否已收藏
 */
const isFavorited = computed(() => favoritesStore.isFavorite(props.item.id));

/**
 * 是否显示收藏按钮（只在有路径的菜单项显示，排除分组菜单和外链）
 */
const showFavoriteButton = computed(() => {
  // 条件：
  // 1. 有路径（排除纯分组菜单）
  // 2. 非折叠状态（折叠时不显示）
  // 3. 不是外部链接
  // 4. 没有子菜单（有子菜单的通常是分组）
  const hasPath = !!props.item.path;
  const notCollapsed = !props.collapsed;
  const notExternal = !isExternalLink.value;
  const noChildren = !hasChildren.value;

  return hasPath && notCollapsed && notExternal && noChildren;
});

function hasActiveChild(children: MenuOptions[]): boolean {
  return children.some((child) => {
    if (child.path === router.currentRoute.value.path) {
      return true;
    }
    if (child.children && child.children.length > 0) {
      return hasActiveChild(child.children);
    }
    return false;
  });
}

/**
 * 检查是否为父菜单高亮（有子菜单激活但自身不是当前路由）
 */
const isParentHighlighted = computed(() => {
  return !isCurrentRoute.value && hasChildren.value && sortedChildren.value.length > 0 && hasActiveChild(sortedChildren.value);
});

onMounted(() => {
  register();

  // 只有当前路由匹配时才展开菜单
  if (hasChildren.value && sortedChildren.value.length > 0 && hasActiveChild(sortedChildren.value)) {
    isExpanded.value = true;
  }
});

watch(
  () => router.currentRoute.value.path,
  () => {
    if (hasChildren.value && sortedChildren.value.length > 0 && hasActiveChild(sortedChildren.value)) {
      isExpanded.value = true;
    }
  },
);

function toggleExpanded() {
  if (props.level === 0 && accordion) {
    // 顶级菜单且启用手风琴模式，使用统一控制
    const currentExpanded = expandedMenuId.value === props.item.id;
    toggleMenuExpand(props.item.id, currentExpanded);
  }
  else {
    // 子菜单或非手风琴模式，独立控制
    isExpanded.value = !isExpanded.value;
  }
}

async function handleClick(event: Event) {
  if (hasChildren.value) {
    if (shouldUseFloatingMenu.value) {
      event.stopPropagation();
      // Floating menu is now handled by UPopover
      return;
    }
    toggleExpanded();
    return;
  }

  if (props.item.path) {
    await router.push(props.item.path);
    if (props.isMobile) {
      emit('menu-item-click');
    }
    return;
  }

  if (props.item.url) {
    window.open(props.item.url, props.item.target || '_blank');
    if (props.isMobile) {
      emit('menu-item-click');
    }
  }
}

function handleToggleFavorite(event: Event) {
  event.stopPropagation();

  // 将 MenuItem 转换为 MenuOptions 格式
  const menuOption = {
    id: props.item.id,
    path: props.item.path || '',
    name: props.item.meta.title,
    meta: props.item.meta,
    params: props.item.params,
    query: props.item.query,
  } as any; // 使用 any 来避免类型检查问题

  const result = favoritesStore.toggleFavorite(menuOption);

  // 可以添加提示消息
  if (result) {
    console.log(`已收藏: ${props.item.meta.title}`);
  }
  else {
    console.log(`已取消收藏: ${props.item.meta.title}`);
  }
}

const { isLucideIcon, lucideIconName } = useLucideIcon();

// 计算缩进样式
const indentStyle = computed(() => {
  if (props.collapsed)
    return {};
  const basePadding = 1;
  const levelPadding = 1.25;
  return {
    paddingLeft: `${basePadding + (props.level * levelPadding)}rem`,
  };
});

const { isOutside } = useMouseInElement(floatingMenu);
</script>

<template>
  <div class="w-full select-none">
    <!-- 折叠状态 -->
    <div v-if="collapsed" class="flex justify-center p-1">
      <template v-if="hasChildren">
        <UPopover mode="hover" :content="{ side: 'right', align: 'start', sideOffset: 12 }">
          <UButton
            color="gray"
            variant="ghost"
            square
            size="lg"

            :class="[
              'transition-all duration-200 cursor-poi',
              isCurrentRoute || isParentHighlighted ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
          >
            <component :is="lucideIconName(item.meta.icon)" v-if="isLucideIcon(item.meta.icon)" :size="20" />
            <UIcon v-else-if="item.meta.icon" :name="item.meta.icon" class="text-xl" />
          </UButton>
          <template #content>
            <div class="min-w-[12rem] p-1">
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 mb-1">
                {{ item.meta.title }}
              </div>
              <div class="flex flex-col gap-0.5">
                <AppMenuItem
                  v-for="(child, i) in sortedChildren"
                  :key="child.id"
                  :collapsed="false"
                  :index="i"
                  :is-mobile="isMobile"
                  :item="child"
                  :level="0"
                  @menu-item-click="emit('menu-item-click')"
                />
              </div>
            </div>
          </template>
        </UPopover>
      </template>
      <template v-else>
        <UTooltip :text="item.meta.title" :popper="{ placement: 'right' }">
          <UButton
            color="gray"
            variant="ghost"
            square
            size="lg"
            :class="[
              'transition-all duration-200',
              isCurrentRoute ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
            @click="handleClick"
          >
            <component :is="lucideIconName(item.meta.icon)" v-if="isLucideIcon(item.meta.icon)" :size="20" />
            <UIcon v-else-if="item.meta.icon" :name="item.meta.icon" class="text-xl" />
          </UButton>
        </UTooltip>
      </template>
    </div>

    <!-- 正常状态 -->
    <div v-else class="relative">
      <div
        class="group/item flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg cursor-pointer transition-all duration-200 select-none"
        :class="[
          isCurrentRoute && !hasChildren
            ? 'bg-primary-50 text-primary-600 font-medium dark:bg-primary-950/30 dark:text-primary-400'
            : isParentHighlighted
              ? 'text-primary-600 font-medium bg-primary-50/50 dark:text-primary-400 dark:bg-primary-950/10'
              : 'text-gray-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
        :style="indentStyle"
        @click="handleClick"
      >
        <div class="flex items-center justify-center flex-shrink-0 transition-colors duration-200">
          <component
            :is="lucideIconName(item.meta.icon)"
            v-if="isLucideIcon(item.meta.icon)"
            :size="20"
            :class="[
              isCurrentRoute || isParentHighlighted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover/item:text-gray-600 dark:group-hover/item:text-gray-300'
            ]"
          />
          <UIcon
            v-else-if="item.meta.icon"
            :name="item.meta.icon"
            class="text-lg"
            :class="[
              isCurrentRoute || isParentHighlighted ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover/item:text-gray-600 dark:group-hover/item:text-gray-300'
            ]"
          />
        </div>

        <span class="flex-1 truncate text-sm">{{ item.meta.title }}</span>

        <ExternalLink v-if="isExternalLink" :size="14" class="text-gray-400 group-hover/item:text-gray-600" />

        <!-- 收藏按钮 -->
        <button
          v-if="showFavoriteButton"
          class="flex items-center justify-center w-7 h-7 rounded opacity-0 group-hover/item:opacity-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all duration-200"
          :class="{ 'opacity-100 text-yellow-500': isFavorited }"
          :aria-label="isFavorited ? `取消收藏 ${item.meta.title}` : `收藏 ${item.meta.title}`"
          @click.stop="handleToggleFavorite"
        >
          <Star
            :size="14"
            :fill="isFavorited ? 'currentColor' : 'none'"
            :class="isFavorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'"
          />
        </button>

        <ChevronRight
          v-if="hasChildren"
          :size="16"
          class="text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-90 text-gray-600 dark:text-gray-300': actualExpanded }"
        />
      </div>

      <!-- 子菜单 -->
      <div
        class="grid transition-[grid-template-rows] duration-300 ease-in-out"
        :class="hasChildren && actualExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
      >
        <div class="overflow-hidden">
          <AppMenuItem
            v-for="(child, i) in sortedChildren"
            :key="child.id"
            :collapsed="collapsed"
            :index="i"
            :is-mobile="isMobile"
            :item="child"
            :level="level + 1"
            @menu-item-click="emit('menu-item-click')"
          />
        </div>
      </div>
    </div>
  </div>
</template>
