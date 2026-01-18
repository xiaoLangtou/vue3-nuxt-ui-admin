<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { AppTabs } from '@/components/app-tabs';
import { useLayoutStore } from '@/stores/layout';
import AppFooter from './app-footer.vue';
import AppHeader from './app-header.vue';
import AppSidebar from './app-sidebar.vue';
import AppConfigurator from '../shared/app-configurator.vue';

const route = useRoute();
const layoutStore = useLayoutStore();


onMounted(() => {
  layoutStore.initLayout();
});

onUnmounted(() => {
  layoutStore.destroyLayout();
});


</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white p-2 gap-2">
    <!-- 侧边栏 (岛屿 1) -->
    <div class="flex-shrink-0 h-full">
      <AppSidebar class="h-full rounded-2xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden" />
    </div>

    <!-- 主内容区域 (岛屿 2) -->
    <div class="flex flex-1 flex-col min-w-0 h-full overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50">
      <!-- 顶部导航栏 -->
      <AppHeader v-if="layoutStore.isShowHeader" class="flex-shrink-0" />

      <!-- 主体内容 -->
      <main class="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <!-- 标签页 -->
        <AppTabs
          v-if="layoutStore.isShowTab"
          :show-icon="layoutStore.isShowIcon"
          :tab-style="layoutStore.tabStyle"
          class="flex-shrink-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800"
        />

        <!-- 滚动容器 -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
          <!-- 路由视图 -->
          <div class="flex-1 p-2 sm:p-2 lg:p-2">
            <router-view />
          </div>

          <!-- 底部页脚 -->
          <AppFooter v-if="layoutStore.isShowFooter" class="flex-shrink-0 border-t border-neutral-100 dark:border-neutral-800" />
        </div>
      </main>
    </div>
    <AppConfigurator v-model:visible="layoutStore.layoutState.configSidebarVisible" />
  </div>
</template>

<style scoped>
</style>
