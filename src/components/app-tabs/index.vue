<script lang="ts" setup>
import type { TabItem } from '@/stores/tabs.ts';
import { useLucideIcon } from '@/composables';
import { useTabsStore } from '@/stores/tabs.ts';
import { onClickOutside, useResizeObserver } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

// 标签页样式
export type TabStyle = 'Card' | 'Square';

interface Props {
    showIcon?: boolean;
    showClose?: boolean;
    tabStyle?: TabStyle;
    enableContextMenu?: boolean;
    class?: string;
}

const props = withDefaults(defineProps<Props>(), {
    showIcon: true,
    showClose: true,
    tabStyle: 'Square',
    enableContextMenu: true,
    class: '',
});

const router = useRouter();
const route = useRoute();
const tabsStore = useTabsStore();
const { isLucideIcon, lucideIconName } = useLucideIcon();

// Refs
const tabsContainerRef = ref<HTMLElement | null>(null);

// State
const searchKeyword = ref('');
const showLeftArrow = ref(false);
const showRightArrow = ref(false);

// Computed
const tabs = computed(() => tabsStore.activeTabs);
const activeTabKey = computed(() => String(tabsStore.activeTabKey));

const filteredTabs = computed(() => {
    if (!searchKeyword.value.trim()) {
        return tabs.value;
    }
    const keyword = searchKeyword.value.toLowerCase().trim();
    return tabs.value.filter((tab: TabItem) => tab.title.toLowerCase().includes(keyword) || (tab.path && tab.path.toLowerCase().includes(keyword)));
});

function getMenuItems(tab: TabItem) {
    const index = tabs.value.findIndex((t: TabItem) => t.key === tab.key);
    const isFirst = index === 0;
    const isLast = index === tabs.value.length - 1;

    return [
        [{
            label: tab.pinned ? '取消固定' : '固定标签页',
            icon: tab.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
            onSelect: () => handleContextMenuAction('togglePin', tab)
        }],
        [{
            label: '重新加载',
            icon: 'i-lucide-refresh-cw',
            onSelect: () => handleContextMenuAction('refresh', tab)
        }],
        [{
            label: '关闭当前标签页',
            icon: 'i-lucide-x',
            onSelect: () => handleContextMenuAction('close', tab),
            disabled: !tab.closable
        }, {
            label: '关闭其他标签页',
            icon: 'i-lucide-circle-x',
            onSelect: () => handleContextMenuAction('closeOthers', tab)
        }, {
            label: '关闭左侧标签页',
            icon: 'i-lucide-arrow-left-to-line',
            onSelect: () => handleContextMenuAction('closeLeft', tab),
            disabled: isFirst
        }, {
            label: '关闭右侧标签页',
            icon: 'i-lucide-arrow-right-to-line',
            onSelect: () => handleContextMenuAction('closeRight', tab),
            disabled: isLast
        }, {
            label: '关闭所有标签页',
            icon: 'i-lucide-trash-2',
            onSelect: () => handleContextMenuAction('closeAll', tab)
        }]
    ];
}

// Actions
function handleTabChange(key: string): void {
    if (key === activeTabKey.value) return;

    tabsStore.setActiveTab(key);
    const tab = tabs.value.find((t: TabItem) => t.key === key);
    if (tab) {
        router.push({
            path: tab.path,
            ...(tab.params && Object.keys(tab.params).length > 0 && { params: tab.params }),
            ...(tab.query && Object.keys(tab.query).length > 0 && { query: tab.query }),
        });
    }
}

function handleTabClose(tab: TabItem, event?: Event): void {
    event?.stopPropagation();
    const success = tabsStore.removeTab(tab.key);
    if (success && tabsStore.activeTab) {
        const activeTab = tabsStore.activeTab;
        router.push({
            path: activeTab.path,
            ...(activeTab.params && Object.keys(activeTab.params).length > 0 && { params: activeTab.params }),
            ...(activeTab.query && Object.keys(activeTab.query).length > 0 && { query: activeTab.query }),
        });
    }
}

function handleContextMenuAction(action: string, tab: TabItem): void {
    switch (action) {
        case 'close':
            handleTabClose(tab);
            break;
        case 'closeOthers':
            tabsStore.closeOtherTabs(tab.key);
            router.push({ path: tab.path });
            break;
        case 'closeAll':
            tabsStore.closeAllTabs();
            if (tabsStore.activeTab) router.push({ path: tabsStore.activeTab.path });
            break;
        case 'closeLeft':
            tabsStore.closeLeftTabs(tab.key);
            break;
        case 'closeRight':
            tabsStore.closeRightTabs(tab.key);
            break;
        case 'refresh':
            tabsStore.setTabLoading(tab.key, true);
            router.go(0);
            break;
        case 'togglePin':
            tabsStore.togglePinTab(tab.key);
            break;
    }
}

function clearSearch() {
    searchKeyword.value = '';
}

function handleScroll() {
    if (!tabsContainerRef.value) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.value;
    showLeftArrow.value = scrollLeft > 0;
    showRightArrow.value = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
}

function scrollLeft() {
    if (!tabsContainerRef.value) return;
    tabsContainerRef.value.scrollBy({ left: -200, behavior: 'smooth' });
}

function scrollRight() {
    if (!tabsContainerRef.value) return;
    tabsContainerRef.value.scrollBy({ left: 200, behavior: 'smooth' });
}

function handleWheel(e: WheelEvent) {
    // 优先响应原生的水平滚动（如触摸板）
    if (Math.abs(e.deltaX) > 0) {
        return;
    }

    // 将垂直滚动转换为水平滚动
    if (tabsContainerRef.value) {
        // e.preventDefault(); // handled by template modifier
        tabsContainerRef.value.scrollLeft += e.deltaY;
    }
}

function scrollToActiveTab() {
    nextTick(() => {
        if (!tabsContainerRef.value) return;
        const activeEl = tabsContainerRef.value.querySelector('.tab-item-active') as HTMLElement;
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
}

// Watchers
useResizeObserver(tabsContainerRef, handleScroll);

watch(tabs, () => {
    nextTick(handleScroll);
}, { deep: true });

watch(() => route.path, (newPath: string) => {
    const currentTab = tabs.value.find((t: TabItem) => t.path === newPath);
    if (currentTab) {
        tabsStore.setActiveTab(currentTab.key);
        scrollToActiveTab();
    } else if (!route.meta?.hideInTabs) {
        tabsStore.addTab(route);
        scrollToActiveTab();
    }
}, { immediate: true });

onMounted(() => {
    if (!route.meta?.hideInTabs) {
        tabsStore.addTab(route);
    }
    if (tabsContainerRef.value) {
        tabsContainerRef.value.addEventListener('scroll', handleScroll);
        handleScroll();
    }
    scrollToActiveTab();
});

onUnmounted(() => {
    if (tabsContainerRef.value) {
        tabsContainerRef.value.removeEventListener('scroll', handleScroll);
    }
});
</script>

<template>
    <div
        class="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div class="flex items-center px-4 h-[44px] gap-2">
            <!-- 左侧滚动按钮 -->
            <UButton v-if="showLeftArrow" icon="i-lucide-chevron-left" size="xs" color="gray" variant="ghost"
                class="flex-shrink-0" @click="scrollLeft" />

            <!-- 标签页列表容器 -->
            <div ref="tabsContainerRef"
                class="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth h-full"
                @wheel.prevent="handleWheel">
                <UContextMenu v-for="tab in tabs" :key="tab.key" :items="getMenuItems(tab)"
                    :disabled="!props.enableContextMenu">
                    <div class="group relative flex items-center gap-2 px-3 py-1.5 h-8 text-sm font-medium cursor-pointer transition-all duration-200 rounded-md min-w-fit max-w-[200px]"
                        :class="[
                            tab.key === activeTabKey
                                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 ring-1 ring-inset ring-primary-500/10 dark:ring-primary-400/20'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                            tab.pinned ? 'px-2' : ''
                        ]" @click="handleTabChange(tab.key)">
                        <!-- 图标 -->
                        <div class="flex-shrink-0 flex items-center justify-center">
                            
                            <component :is="lucideIconName(tab.icon)"
                                v-if="tab.pinned && !props.showIcon && tab.icon && isLucideIcon(tab.icon)" class="w-4 h-4" />
                            <component :is="lucideIconName(tab.icon)"
                                v-if="props.showIcon && tab.icon && isLucideIcon(tab.icon)" class="w-4 h-4" />
                        </div>

                        <!-- 标题 (非固定状态显示) -->
                        <span v-if="!tab.pinned" class="truncate">{{ tab.title }}</span>

                        <!-- 关闭按钮 (非固定且悬浮或激活时显示) -->
                        <div v-if="!tab.pinned && tab.closable"
                            class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700/80 transition-colors ml-0.5 opacity-0 group-hover:opacity-100"
                            :class="{ 'opacity-100': tab.key === activeTabKey }"
                            @click.stop="handleTabClose(tab, $event)">
                            <UIcon name="i-lucide-x" class="w-3.5 h-3.5" />
                        </div>
                    </div>
                </UContextMenu>
            </div>

            <!-- 右侧滚动按钮 -->
            <UButton v-if="showRightArrow" icon="i-lucide-chevron-right" size="xs" color="gray" variant="ghost"
                class="flex-shrink-0" @click="scrollRight" />

            <!-- 右侧操作区 -->
            <div
                class="flex items-center gap-1 flex-shrink-0 pl-2 border-l border-gray-200 dark:border-gray-800 bg-transparent h-6">
                <UPopover v-if="tabs.length > 1" :content="{ align: 'end', side: 'bottom' }">
                    <UButton color="gray" variant="ghost" size="xs" icon="i-lucide-chevron-down"
                        :ui="{ rounded: 'rounded-lg' }">
                        <template #trailing>
                            <UBadge :label="String(tabs.length)" color="primary" size="xs" variant="subtle" />
                        </template>
                    </UButton>

                    <template #content>
                        <div class="w-72 p-2">
                            <UInput v-model="searchKeyword" icon="i-lucide-search" placeholder="搜索标签页..."
                                class="mb-2 w-full">
                                <template v-if="searchKeyword" #trailing>
                                    <UButton icon="i-lucide-x" size="2xs" color="gray" variant="link"
                                        @click="clearSearch" />
                                </template>
                            </UInput>

                            <div class="max-h-[300px] overflow-y-auto space-y-0.5">
                                <div v-for="tab in filteredTabs" :key="tab.key"
                                    class="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                                    :class="{ 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400': tab.key === activeTabKey }"
                                    @click="handleTabChange(tab.key)">
                                    <div
                                        class="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                        <component :is="lucideIconName(tab.icon)"
                                            v-if="tab.icon && isLucideIcon(tab.icon)" class="w-4 h-4" />
                                        <UIcon v-else-if="tab.icon" :name="tab.icon" class="w-4 h-4" />
                                    </div>
                                    <span class="flex-1 text-[14px] truncate">{{ tab.title }}</span>
                                    <UButton v-if="tab.closable" icon="i-lucide-x" size="2xs" color="gray"
                                        variant="ghost" class="opacity-0 group-hover:opacity-100"
                                        @click.stop="handleTabClose(tab)" />
                                </div>
                            </div>
                        </div>
                    </template>
                </UPopover>
            </div>
        </div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
