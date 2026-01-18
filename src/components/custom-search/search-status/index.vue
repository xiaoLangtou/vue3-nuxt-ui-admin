<script setup lang="ts">
import type { SearchParams } from '@types/search.ts';
import { SearchHelpers } from '@/utils/search-helpers.ts';
import { computed, withDefaults } from 'vue';

interface Props {
    /** 搜索参数 */
    params: SearchParams;
    /** 结果总数 */
    total: number;
    /** 是否显示分页信息 */
    showPagination?: boolean;
    /** 筛选配置映射（用于显示中文标签） */
    filterLabels?: Record<string, string>;
}

interface Emits {
    (e: 'clear'): void;
    (e: 'remove-filter', key: string): void;
}

const props = withDefaults(defineProps<Props>(), {
    showPagination: true
});

defineEmits<Emits>();

// 活跃的筛选条件
const activeFilters = computed(() => {
    return SearchHelpers.getActiveFilters(props.params.filters);
});

// 是否有搜索条件
const hasConditions = computed(() => {
    return props.params.keyword || Object.keys(activeFilters.value).length > 0;
});

/**
 * 格式化筛选条件显示
 */
const formatFilterValue = (key: string, value: any): string => {
    const labels = props.filterLabels || {};
    const label = labels[key] || key;
    return SearchHelpers.formatFilterValue(label, value, 15);
};

</script>

<template>
    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
    >
        <div v-if="hasConditions" class="mt-4 px-1">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm text-gray-500">当前筛选条件：</span>

                <!-- Keyword Tag -->
                <UBadge
                    v-if="params.keyword"
                    color="primary"
                    variant="subtle"
                    class="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                    <UIcon name="i-lucide-search" class="w-3 h-3" />
                    <span class="text-xs font-medium">{{ params.keyword }}</span>
                    <UButton
                        icon="i-lucide-x"
                        size="2xs"
                        color="primary"
                        variant="ghost"
                        :padded="false"
                        class="ml-1"
                        @click="$emit('remove-filter', 'keyword')"
                    />
                </UBadge>

                <!-- Filter Tags -->
                <UBadge
                    v-for="(value, key) in activeFilters"
                    :key="key"
                    color="blue"
                    variant="subtle"
                    class="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                    <span class="text-xs font-medium">{{ formatFilterValue(key, value) }}</span>
                    <UButton
                        icon="i-lucide-x"
                        size="2xs"
                        color="blue"
                        variant="ghost"
                        :padded="false"
                        class="ml-1"
                        @click="$emit('remove-filter', key)"
                    />
                </UBadge>

                <UButton
                    v-if="hasConditions"
                    label="清空所有"
                    size="xs"
                    color="red"
                    variant="link"
                    class="ml-2"
                    @click="$emit('clear')"
                />
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Scoped styles replaced by Tailwind classes */
</style>
