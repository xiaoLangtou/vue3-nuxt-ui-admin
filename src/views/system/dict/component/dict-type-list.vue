<script lang="ts" setup>
import type { IDictType } from '@/services/types/dict';

defineProps<{
    list: IDictType[];
    total: number;
    loading: boolean;
    fetchingMore: boolean;
    selectedId?: string | number;
}>();

const emit = defineEmits<{
    select: [dict: IDictType];
    edit: [dict: IDictType];
    remove: [dict: IDictType];
    create: [];
    scrollEnd: [];
}>();

const searchValue = defineModel<string>('search', { default: '' });

const handleScroll = (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.scrollTop + t.clientHeight >= t.scrollHeight - 10) emit('scrollEnd');
};
</script>

<template>
    <div class="w-80 flex flex-col bg-white dark:bg-gray-800 border border-neutral-100 dark:border-gray-700 rounded-xl">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold m-0">字典类型</h3>
                    <UBadge :label="total" color="primary" size="sm" variant="subtle" />
                </div>
                <UButton v-tooltip="'新增字典'" color="primary" icon="i-lucide-plus" size="sm"
                    @click="emit('create')" />
            </div>
            <UInput v-model="searchValue" class="w-full" icon="i-lucide-search" placeholder="搜索字典名称/编码"
                size="sm" />
        </div>

        <div class="flex-1 overflow-y-auto px-3 py-2" @scroll="handleScroll">
            <div v-if="loading && !list.length" class="flex justify-center py-12">
                <UIcon class="w-6 h-6 animate-spin text-primary-500" name="i-lucide-loader-2" />
            </div>
            <div v-else-if="!list.length" class="flex flex-col items-center py-12 text-gray-400">
                <UIcon class="w-8 h-8 mb-2" name="i-lucide-inbox" />
                <p class="text-xs">暂无数据</p>
            </div>
            <div v-else class="space-y-1">
                <div v-for="dict in list" :key="dict.id"
                    class="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    :class="selectedId === dict.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                    @click="emit('select', dict)">
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">{{ dict.dictName }}</div>
                        <code class="text-xs text-gray-500 dark:text-gray-400 truncate block">{{ dict.dictCode }}</code>
                    </div>
                    <div class="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <UButton v-tooltip.top="'编辑'" color="gray" icon="i-lucide-pen-line" size="xs" variant="ghost"
                            @click.stop="emit('edit', dict)" />
                        <UButton v-if="dict.systemFlag !== 'SYSTEM'" v-tooltip.top="'删除'" color="gray"
                            icon="i-lucide-trash-2" size="xs" variant="ghost"
                            @click.stop="emit('remove', dict)" />
                    </div>
                </div>
                <div v-if="fetchingMore" class="flex justify-center py-2">
                    <UIcon class="w-4 h-4 animate-spin text-primary-500" name="i-lucide-loader-2" />
                </div>
            </div>
        </div>
    </div>
</template>
