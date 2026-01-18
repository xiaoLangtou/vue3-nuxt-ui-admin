<script setup lang="ts">
import { useDebounce } from '@/composables/useDebounce.ts';
import type { FilterConfig, SearchParams } from '@types/search.ts';
import { computed, onMounted, reactive, ref, watch, withDefaults } from 'vue';
import FilterItem from '../filter-item/index.vue';

interface Props {
    /** 筛选配置列表 */
    filterConfigs: FilterConfig[];
    /** 搜索框占位符 */
    placeholder?: string;
    /** 加载状态 */
    loading?: boolean;
    /** 结果总数 */
    total?: number;
    /** 搜索参数 */
    modelValue?: SearchParams;
    /** 是否自动搜索 */
    autoSearch?: boolean;
    /** 防抖延迟时间 */
    debounceDelay?: number;
    /** 是否显示分页信息 */
    showPaginationInfo?: boolean;
    /** 是否显示验证错误 */
    showValidationErrors?: boolean;
    /** 筛选项列数配置 */
    filterColumns?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

interface Emits {
    (e: 'search', params: SearchParams): void;
    (e: 'update:modelValue', params: SearchParams): void;
    (e: 'reset'): void;
    (e: 'filter-change', key: string, value: any): void;
    (e: 'keyword-change', keyword: string): void;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '请输入关键词搜索',
    loading: false,
    total: 0,
    autoSearch: false,
    debounceDelay: 300,
    showPaginationInfo: true,
    showValidationErrors: false
});

const emit = defineEmits<Emits>();

// 本地搜索参数
const localParams = reactive<SearchParams>({
    keyword: '',
    filters: {}
});

// 界面状态
const showAdvanced = ref(false);
const filterRefs = ref<Record<string, any>>({});
const isFormValid = ref(true);
const validationState = ref<Record<string, boolean>>({});

// 防抖搜索
const { debounce } = useDebounce(props.debounceDelay);

// 监听 modelValue 变化
watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue) {
            Object.assign(localParams, {
                keyword: newValue.keyword || '',
                filters: newValue.filters ? { ...newValue.filters } : {},
                pagination: newValue.pagination ? { ...newValue.pagination } : { page: 1, size: 20 },
                sort: newValue.sort ? { ...newValue.sort } : { field: 'createTime', order: 'desc' }
            });
        }
    },
    { immediate: true, deep: true }
);

// 活跃筛选条件数量
const activeFilterCount = computed(() => {
    return Object.keys(localParams.filters).filter((key) => {
        const value = localParams.filters[key];
        return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
    }).length;
});

/**
 * 获取列样式类 (Tailwind Grid)
 * @param filter 筛选配置
 */
const getColumnClass = (filter: FilterConfig) => {
    const cols = props.filterColumns || {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 3,
        xl: 3
    };
    return [
        `col-span-${cols.xs || 12}`,
        `sm:col-span-${cols.sm || 6}`,
        `md:col-span-${cols.md || 4}`,
        `lg:col-span-${cols.lg || 3}`,
        `xl:col-span-${cols.xl || 3}`
    ].join(' ');
};

/**
 * 处理关键词变化
 */
const handleKeywordChange = () => {
    emit('keyword-change', localParams.keyword || '');

    if (props.autoSearch) {
        localParams.pagination.page = 1;
        debounce(handleSearch);
    }
};

/**
 * 处理筛选条件更新
 * @param key 筛选字段
 * @param value 筛选值
 */
const handleFilterUpdate = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
        delete localParams.filters[key];
    } else {
        localParams.filters[key] = value;
    }

    localParams.pagination.page = 1;
    emit('filter-change', key, value);

    if (props.autoSearch) {
        debounce(handleSearch);
    }
};

/**
 * 立即搜索
 */
const handleImmediateSearch = () => {
    // 验证表单
    if (props.showValidationErrors && !validateForm()) {
        return;
    }

    handleSearch();
};

/**
 * 执行搜索
 */
const handleSearch = () => {
    const searchParams = { ...localParams };
    emit('search', searchParams);
    emit('update:modelValue', searchParams);
};

/**
 * 重置搜索
 */
const handleReset = () => {
    localParams.keyword = '';
    localParams.filters = {};
    localParams.pagination.page = 1;

    // 清除验证错误
    Object.keys(filterRefs.value).forEach((key) => {
        const ref = filterRefs.value[key];
        if (ref && ref.clearError) {
            ref.clearError();
        }
    });

    emit('reset');
    handleSearch();
};

/**
 * 清空筛选条件
 */
const handleClearFilters = () => {
    localParams.filters = {};
    localParams.pagination.page = 1;

    // 清除验证错误
    Object.keys(filterRefs.value).forEach((key) => {
        const ref = filterRefs.value[key];
        if (ref && ref.clearError) {
            ref.clearError();
        }
    });

    if (props.autoSearch) {
        handleSearch();
    }
};

/**
 * 清除关键词
 */
const clearKeyword = () => {
    localParams.keyword = '';
    emit('keyword-change', '');

    if (props.autoSearch) {
        localParams.pagination.page = 1;
        debounce(handleSearch);
    }
};

/**
 * 切换高级筛选
 */
const toggleAdvanced = () => {
    showAdvanced.value = !showAdvanced.value;
};

/**
 * 验证表单
 */
const validateForm = (): boolean => {
    let isValid = true;

    Object.keys(filterRefs.value).forEach((key) => {
        const ref = filterRefs.value[key];
        if (ref && ref.validate) {
            const valid = ref.validate();
            if (!valid) {
                isValid = false;
            }
        }
    });

    return isValid;
};

/**
 * 获取当前搜索参数
 */
const getSearchParams = () => {
    return { ...localParams };
};

/**
 * 设置搜索参数
 * @param params 搜索参数
 */
const setSearchParams = (params: Partial<SearchParams>) => {
    Object.assign(localParams, params);
};

// 初始化默认筛选值
onMounted(() => {
    props.filterConfigs.forEach((filter) => {
        if (filter.defaultValue !== undefined) {
            localParams.filters[filter.key] = filter.defaultValue;
        }
        // 初始化验证状态
        validationState.value[filter.key] = true;
    });
});

// 暴露方法
defineExpose({
    search: handleSearch,
    reset: handleReset,
    validate: validateForm,
    getSearchParams,
    setSearchParams,
    toggleAdvanced,
    params: localParams
});
</script>

<template>
    <UCard :ui="{ body: { padding: 'p-3 sm:p-4' } }" class="search-container">
        <!-- 基础搜索栏 -->
        <div class="flex flex-col sm:flex-row gap-4">
            <!-- 搜索框组 -->
            <div class="flex flex-1 gap-2 min-w-0">
                <UInput
                    v-model="localParams.keyword"
                    :placeholder="placeholder"
                    icon="i-lucide-search"
                    class="flex-1"
                    @input="handleKeywordChange"
                    @keyup.enter="handleImmediateSearch"
                >
                    <template #trailing v-if="localParams.keyword">
                        <UButton
                            color="gray"
                            variant="link"
                            icon="i-lucide-x"
                            :padded="false"
                            @click="clearKeyword"
                        />
                    </template>
                </UInput>
                <UButton label="搜索" icon="i-lucide-search" :loading="loading" @click="handleImmediateSearch" />
            </div>

            <!-- 操作按钮组 -->
            <div class="flex gap-2 flex-shrink-0 justify-end sm:justify-start">
                <UButton
                    v-if="filterConfigs.length > 0"
                    :label="showAdvanced ? '收起筛选' : '高级筛选'"
                    :icon="showAdvanced ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                    color="gray"
                    variant="outline"
                    @click="toggleAdvanced"
                >
                    <template #trailing v-if="activeFilterCount > 0">
                        <UBadge :label="activeFilterCount" color="primary" size="xs" variant="subtle" />
                    </template>
                </UButton>
                <UButton label="重置" icon="i-lucide-refresh-cw" color="gray" variant="outline" @click="handleReset" />
                <slot name="actions"></slot>
            </div>
        </div>

        <!-- 高级筛选面板 -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
        >
            <div v-if="showAdvanced && filterConfigs.length > 0" class="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h4 class="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <UIcon name="i-lucide-filter" class="text-primary-500 w-4 h-4" />
                        筛选条件
                    </h4>
                </div>

                <div class="p-4 grid grid-cols-12 gap-4">
                    <div v-for="filter in filterConfigs" :key="filter.key" :class="getColumnClass(filter)">
                        <FilterItem
                            :ref="(el) => (filterRefs[filter.key] = el)"
                            :config="filter"
                            :value="localParams.filters[filter.key]"
                            :immediate="false"
                            :show-error="showValidationErrors"
                            @update="handleFilterUpdate"
                        >
                            <template v-if="filter.type === 'slot' && filter.slotName" #[filter.slotName]="scope">
                                <slot :name="filter.slotName" v-bind="scope" />
                            </template>
                        </FilterItem>
                    </div>
                </div>

                <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
                    <div class="text-sm text-gray-500">
                        <span v-if="activeFilterCount > 0">已设置 {{ activeFilterCount }} 个筛选条件</span>
                    </div>
                    <div class="flex gap-2">
                        <UButton label="清空筛选" icon="i-lucide-x" size="xs" color="gray" variant="ghost" @click="handleClearFilters" />
                        <UButton label="应用筛选" icon="i-lucide-check" size="xs" :disabled="!isFormValid" @click="handleImmediateSearch" />
                    </div>
                </div>
            </div>
        </Transition>
    </UCard>
</template>

<style scoped>
/* 
Styles are mostly handled by Tailwind classes in template.
Retaining scoped style block for potential overrides if needed, but currently empty/minimal.
*/
.search-container {
    @apply shadow-none;
}
</style>
