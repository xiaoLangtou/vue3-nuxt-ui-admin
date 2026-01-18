<script lang="ts" setup>
import { useNuxtConfirm } from '@/composables/useNuxtConfirm';
import type { IDictData, IDictType } from '@/services/types/dict';
import { watchDebounced } from '@vueuse/core';
import DictItemDialog from './component/dict-item-dialog.vue';
import DictTypeForm from './component/dict-type-form.vue';
import { useDictManagement } from './composables/useDictManagement';
import type DictTypeFormComponent from './component/dict-type-form.vue';


const { confirmDelete } = useNuxtConfirm();
const dictTypeForm = useTemplateRef<InstanceType<typeof DictTypeFormComponent>>('dictTypeForm');

// 使用字典管理 composable
const {
    dictTypeList,
    totalDictTypes,
    dictTypeLoading,
    isFetchingNextPage,
    updateSearch,
    loadMoreDictTypes,
    refetchDictTypes,
    selectedDictType,
    selectedDictTypeId,
    dictItems,
    itemsLoading,
    refetchDictItems,
    selectDictType,
    deleteDictType,
    deleteDictItem,
    tableColumns,
} = useDictManagement();

// 搜索
const searchValue = ref('');
watchDebounced(
    searchValue,
    (val: string) => {
        updateSearch(val);
    },
    { debounce: 500 }
);

// 字典项对话框
const dictItemDialogVisible = ref(false);

/**
 * 删除字典项
 */
const handleDeleteDictItem = async (item: IDictData) => {
    confirmDelete({
        message: `确定要删除字典项 "${item.dictLabel}" 吗？`,
        title: '确认删除',
        accept: async () => {
            await deleteDictItem(item.id as string);
        }
    });
};

/**
 * 打开新增字典类型表单
 */
const openNewDictType = () => {
    dictTypeForm.value?.openDrawer();
};

/**
 * 编辑字典类型
 */
const editDictType = (dictType: IDictType) => {
    dictTypeForm.value?.openDrawer(dictType);
};

/**
 * 删除字典类型
 */
const handleDeleteDictType = async (dictType: IDictType) => {
    confirmDelete({
        message: `确定要删除字典类型 "${dictType.dictName}(${dictType.dictCode})" 吗？`,
        title: '确认删除',
        accept: async () => {
            await deleteDictType(dictType.id as string | number);
        }
    });
};

/**
 * 处理滚动加载更多
 */
const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
        loadMoreDictTypes();
    }
};

/**
 * 打开字典项对话框
 */
const openDictItemDialog = () => {
    dictItemDialogVisible.value = true;
};

/**
 * 格式化字典类型
 */
const formatterDictType = (value: string) => {
    return {
        SYSTEM: '系统字典',
        BUSINESS: '业务字典'
    }[value];
};

/**
 * 字典项添加成功
 */
const handleDictItemSuccess = async () => {
    await refetchDictItems();
};

/**
 * 刷新字典类型列表
 */
const handleRefresh = async () => {
    await refetchDictTypes();
};

</script>

<template>
    <div class="h-full flex overflow-hidden rounded-md gap-3">
        <!-- 左侧分栏 -->
        <div class="w-80  bg-white  border border-neutral-100 dark:bg-gray-800 flex flex-col rounded-xl">
            <div class="px-6 py-4 relative z-10 bg-white dark:bg-gray-800 rounded-t-xl"
                style="box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <UIcon name="i-lucide-list" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white m-0">字典类型</h3>
                    </div>
                    <UBadge :label="totalDictTypes" color="primary" variant="subtle" />
                </div>
                <div class="flex gap-2">
                    <UInput v-model="searchValue" icon="i-lucide-search" class="w-full" placeholder="搜索字典名称/编码"
                        size="sm" />
                    <UButton v-tooltip="'新增字典'" icon="i-lucide-plus" color="primary" size="sm"
                        @click="openNewDictType" />
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-3 py-3" @scroll="handleScroll">
                <div v-if="dictTypeLoading && dictTypeList.length === 0" class="flex justify-center items-center py-12">
                    <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
                </div>
                <div v-else-if="dictTypeList.length === 0"
                    class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <UIcon name="i-lucide-inbox" class="w-8 h-8 mb-2" />
                    <p class="text-xs">暂无数据</p>
                </div>
                <div v-else class="space-y-1.5">
                    <div v-for="dict in dictTypeList" :key="dict.id" :class="[
                        'group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                        selectedDictType?.id === dict.id
                            ? 'from-primary-50 to-primary-50/50 dark:from-primary-900/30 dark:to-primary-900/10 text-primary-700 dark:text-primary-400 shadow-md'
                            : 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                    ]" @click="selectDictType(dict)">

                        <!-- 图标容器 -->
                        <div :class="[
                            'w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all duration-200',
                            selectedDictType?.id === dict.id
                                ? dict.systemFlag === 'SYSTEM'
                                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shadow-sm'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                                : dict.systemFlag === 'SYSTEM'
                                    ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400'
                                    : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400'
                        ]">
                            <UIcon :name="dict.systemFlag === 'SYSTEM' ? 'i-lucide-shield' : 'i-lucide-bookmark'"
                                class="w-5 h-5" />
                        </div>

                        <!-- 内容区域 -->
                        <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-sm font-semibold truncate">{{ dict.dictName }}</span>
                                <!-- 悬停操作区 -->
                                <div
                                    class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                    <UButton v-tooltip.top="'编辑'" color="gray" variant="ghost" icon="i-lucide-pen-line"
                                        size="xs"
                                        class="!p-1 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                        @click.stop="editDictType(dict)" />
                                    <UButton v-if="dict.systemFlag !== 'SYSTEM'" v-tooltip.top="'删除'" color="gray"
                                        variant="ghost" icon="i-lucide-trash-2" size="xs"
                                        class="!p-1 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        @click.stop="handleDeleteDictType(dict)" />
                                </div>
                            </div>

                            <div class="flex items-center justify-between gap-2">
                                <code :class="[
                                    'text-xs font-mono truncate transition-colors',
                                    selectedDictType?.id === dict.id ? 'text-primary-600/80 dark:text-primary-400/80' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                ]">
                                    {{ dict.dictCode }}
                                </code>

                            </div>
                        </div>
                    </div>
                    <!-- 加载更多指示器 -->
                    <div v-if="isFetchingNextPage" class="flex justify-center py-2">
                        <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-primary-500" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧分栏:字典项列表 -->
        <div class="flex-1 flex flex-col border border-neutral-100 bg-white dark:bg-gray-800 rounded-xl">
            <!-- 头部 -->
            <div class="px-6 py-4 relative z-10 bg-white dark:bg-gray-800 rounded-t-xl"
                style="box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);">
                <div v-if="selectedDictType">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <UIcon name="i-lucide-database"
                                    class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 class="text-lg font-bold text-gray-800 dark:text-white m-0">{{ selectedDictType.dictName
                                }}</h3>
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <UBadge :label="formatterDictType(selectedDictType.systemFlag)"
                                :color="selectedDictType.systemFlag === 'SYSTEM' ? 'error' : 'info'" variant="subtle"
                                size="xs" />
                            <span class="text-xs text-gray-500 dark:text-gray-400">{{ selectedDictType.dictCode
                                }}</span>
                        </div>
                        <UButton icon="i-lucide-plus" label="添加字典项" size="sm" @click="openDictItemDialog()" />
                    </div>
                </div>
                <div v-else class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <UIcon name="i-lucide-info" class="w-4 h-4" />
                    <span>请选择字典类型</span>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-6 py-4">
                <div v-if="!selectedDictType" class="flex flex-col items-center justify-center h-full">
                    <div
                        class="w-24 h-24 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-4">
                        <UIcon name="i-lucide-arrow-left" class="w-10 h-10 text-gray-400" />
                    </div>
                    <p class="text-gray-500 dark:text-gray-400 text-base font-medium">请从左侧选择一个字典类型</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">选择后即可查看和管理字典项</p>
                </div>
                <div v-else>
                    <!-- 字典项表格 -->
                    <UTable :data="dictItems || []" :columns="tableColumns" :loading="itemsLoading" class="w-full">
                        <template #dictLabel-cell="{ row }">
                            <div class="flex items-center gap-2">
                                <span class="font-medium">{{ row.original.dictLabel }}</span>
                                <UIcon v-if="row.original.isDefault == 1" v-tooltip.top="'默认值'" name="i-lucide-star"
                                    class="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            </div>
                        </template>

                        <template #dictValue-cell="{ row }">
                            <UBadge color="gray" variant="subtle" :label="row.original.dictValue" class="font-mono" />
                        </template>

                        <template #dictSort-cell="{ row }">
                            <div class="text-center">{{ row.original.dictSort }}</div>
                        </template>

                        <template #status-cell="{ row }">
                            <UBadge :label="row.original.status == 1 ? '启用' : '停用'"
                                :color="row.original.status == 1 ? 'success' : 'error'" variant="subtle" size="xs" />
                        </template>

                        <template #actions-cell="{ row }">
                            <div class="flex items-center justify-center gap-1">
                                <UButton v-tooltip.bottom="'删除'" icon="i-lucide-trash-2" color="red" variant="ghost"
                                    size="xs" @click="handleDeleteDictItem(row.original)" />
                            </div>
                        </template>

                        <template #empty>
                            <div
                                class="flex flex-col items-center justify-center py-6 text-center text-gray-400 dark:text-gray-500">
                                <UIcon name="i-lucide-inbox" class="w-8 h-8 mb-2" />
                                <p>暂无数据</p>
                            </div>
                        </template>
                    </UTable>
                </div>
            </div>
        </div>
    </div>

    <!-- 字典类型表单 -->
    <DictTypeForm ref="dictTypeForm" @success="handleRefresh" />

    <!-- 字典项对话框 -->
    <DictItemDialog v-model:open="dictItemDialogVisible" :dict-type-id="selectedDictTypeId"
        :existing-items="dictItems" @success="handleDictItemSuccess" />
</template>

<style lang="scss" scoped>
// 自定义滚动条样式
:deep(.overflow-y-auto),
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.3) transparent;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.3);
        border-radius: 6px;

        &:hover {
            background-color: rgba(156, 163, 175, 0.5);
        }
    }
}

// 平滑过渡动画
.group {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
