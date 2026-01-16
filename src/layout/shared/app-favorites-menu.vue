<script lang="ts" setup>
import { Star } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useLucideIcon } from '@/composables';
import { useFavoritesStore } from '@/stores/favorites';

// ==================== Props ====================
interface Props {
  /** 是否折叠状态 */
  collapsed?: boolean;
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
});

const emit = defineEmits<{
  'menu-item-click': [];
}>();

// ==================== 状态管理 ====================
const router = useRouter();
const favoritesStore = useFavoritesStore();
const { isLucideIcon, lucideIconName } = useLucideIcon();

// ==================== 计算属性 ====================
/** 是否有收藏 */
const hasFavorites = computed(() => favoritesStore.count > 0);

/** 当前路由路径 */
const currentPath = computed(() => router.currentRoute.value.path);

/** 检查菜单是否为当前激活路由 */
function isActiveRoute(path: string): boolean {
  return currentPath.value === path;
}

// ==================== 事件处理 ====================
/**
 * 处理菜单项点击
 */
function handleMenuClick(item: any) {
  router.push({
    path: item.path,
    ...(item.params && Object.keys(item.params).length > 0 && { params: item.params }),
    ...(item.query && Object.keys(item.query).length > 0 && { query: item.query }),
  });
  emit('menu-item-click');
}

/**
 * 取消收藏
 */
function handleRemoveFavorite(event: Event, menuId: number) {
  event.stopPropagation();
  favoritesStore.removeFavorite(menuId);
}
</script>

<template>
  <div v-if="hasFavorites" class="w-full">
    <!-- 折叠状态 -->
    <template v-if="collapsed">
      <div class="flex justify-center py-3 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-105">
          <Star :size="20" fill="currentColor" class="text-yellow-500" />
        </div>
      </div>
    </template>

    <!-- 展开状态 -->
    <template v-else>
      <!-- 分组标题 -->
      <div class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <Star :size="16" fill="currentColor" class="text-yellow-500 flex-shrink-0" />
        <span class="flex-1">常用功能</span>
        <span class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold text-white bg-primary-500 rounded-full">
          {{ favoritesStore.count }}
        </span>
      </div>

      <!-- 收藏列表 -->
      <div class="flex flex-col gap-0.5 px-2">
        <div
          v-for="item in favoritesStore.favoriteMenus"
          :key="item.id"
          class="group flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 select-none relative"
          :class="[
            isActiveRoute(item.path)
              ? 'bg-primary-50 text-primary-600 font-medium dark:bg-primary-950/30 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click="handleMenuClick(item)"
        >
          <!-- 选中指示条 -->
          <div
            v-if="isActiveRoute(item.path)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-primary-500 rounded-r opacity-100"
          />

          <!-- 图标 -->
          <div class="flex items-center justify-center flex-shrink-0 transition-colors duration-200">
            <component
              :is="lucideIconName(item.icon)"
              v-if="isLucideIcon(item.icon)"
              :size="18"
              :class="[
                isActiveRoute(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              ]"
            />
            <UIcon
              v-else-if="item.icon"
              :name="item.icon"
              class="text-base"
              :class="[
                isActiveRoute(item.path) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              ]"
            />
          </div>

          <!-- 标题 -->
          <span class="flex-1 truncate text-sm">{{ item.title }}</span>

          <!-- 取消收藏按钮 -->
          <button
            class="flex items-center justify-center w-6 h-6 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all duration-200"
            :aria-label="`取消收藏 ${item.title}`"
            @click="handleRemoveFavorite($event, item.id)"
          >
            <Star :size="14" fill="currentColor" class="text-yellow-500" />
          </button>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="h-px mx-4 my-3 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
    </template>
  </div>
</template>
