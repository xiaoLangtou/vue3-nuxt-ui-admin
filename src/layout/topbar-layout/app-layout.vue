<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useLayoutStore } from '@/stores/layout';
import AppHeaderLogo from '../shared/app-header-logo.vue';
import AppTopbar from '../shared/app-topbar.vue';
import AppFooter from './app-footer.vue';
import AppConfigurator from '../shared/app-configurator.vue';
import AppMegaMenu from './app-mega-menu.vue';

const layoutStore = useLayoutStore();
const { layoutConfig, layoutState } = storeToRefs(layoutStore);

// 提供布局配置给子组件
provide('layoutConfig', layoutConfig);
provide('layoutState', layoutState);
</script>

<template>
    <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <!-- 顶部固定导航栏 -->
        <UHeader :ui="{
            wrapper: 'sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md transition-colors duration-300',
            container: 'max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8',
            left: 'flex-shrink-0 flex items-center',
            center: 'hidden lg:flex flex-1 justify-center px-8',
            right: 'flex-shrink-0 flex items-center gap-2'
        }">
            <template #left>
                <AppHeaderLogo />
            </template>

            <template #center>
                <AppMegaMenu />
            </template>

            <template #right>
                <AppTopbar />
            </template>
        </UHeader>

        <!-- 主内容区域 -->
        <main class="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div
                class="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 min-h-[calc(100vh-8rem)] transition-colors duration-300 overflow-hidden">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in" enter-active-class="transition-opacity duration-200 ease-out"
                        enter-from-class="opacity-0" enter-to-class="opacity-100"
                        leave-active-class="transition-opacity duration-150 ease-in" leave-from-class="opacity-100"
                        leave-to-class="opacity-0">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>
        </main>

        <!-- 底部 Footer -->
        <AppFooter class="mt-auto" />

        <!-- 配置抽屉 -->
        <AppConfigurator v-model:visible="layoutStore.layoutState.configSidebarVisible" />
    </div>
</template>

<style scoped>
/* 滚动条美化 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

/* ::-webkit-scrollbar-thumb {
  @apply bg-neutral-300 dark:bg-neutral-700 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-neutral-400 dark:bg-neutral-600;
} */
</style>
