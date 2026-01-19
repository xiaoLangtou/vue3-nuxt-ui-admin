<script setup lang="ts">
import { useLogsManagement } from './composables/useLogsManagement';
import type { ILogs } from '@/services/types/logs';
import LogsDetail from './components/details.vue';
import { ListSearch } from '@/components/custom-search';
import { EnhancedPagination } from '@/components/enhanced-pagination';
import type { FilterConfig, SearchParams } from '@/types/search';

const {
    logsList,
    total,
    isLoading,
    tableColumns,
    pageInfo,
    searchParams: logsSearchParams,
    updateSearch,
    handlePageChange,
    handleSizeChange,
    refetchLogs,
} = useLogsManagement();

const detailDialogVisible = ref(false);
const selectedLog = ref<ILogs | null>(null);

// 搜索参数
const searchParams = ref<SearchParams>({
    keyword: '',
    filters: {},
    pagination: { page: pageInfo.value.current, size: pageInfo.value.size },
    sort: { field: 'createTime', order: 'desc' }
});

// 筛选配置
const filterConfigs: FilterConfig[] = [
    {
        key: 'logType',
        label: '日志类型',
        type: 'input',
        placeholder: '请输入日志类型'
    },
    {
        key: 'module',
        label: '所属模块',
        type: 'input',
        placeholder: '请输入模块名称'
    },
    {
        key: 'createBy',
        label: '创建人',
        type: 'input',
        placeholder: '请输入创建人'
    },
    {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
            { label: '全部', value: '' },
            { label: '成功', value: 200 },
            { label: '失败', value: 500 }
        ]
    }
];

const openDetail = (log: ILogs) => {
    selectedLog.value = log;
    detailDialogVisible.value = true;
};

const handleSearch = (params: SearchParams) => {
    updateSearch({
        logType: params.filters?.logType || '',
        module: params.filters?.module || '',
        createBy: params.filters?.createBy || '',
        status: params.filters?.status,
        startTime: params.filters?.startTime || '',
        endTime: params.filters?.endTime || '',
    });
    pageInfo.value.current = params.pagination?.page || 1;
    pageInfo.value.size = params.pagination?.size || 20;
};

const handleReset = () => {
    searchParams.value = {
        keyword: '',
        filters: {},
        pagination: { page: 1, size: 20 },
        sort: { field: 'createTime', order: 'desc' }
    };
    updateSearch({
        logType: '',
        module: '',
        createBy: '',
        startTime: '',
        endTime: '',
    });
};
</script>

<template>
    <div class="h-full flex flex-col gap-4">
        <!-- 搜索区域 -->
        <ListSearch v-model:search-params="searchParams" :filter-configs="filterConfigs" :loading="isLoading"
            :total="total" placeholder="请输入搜索关键词" @search="handleSearch" @reset="handleReset" />

        <!-- 表格区域 -->
        <div
            class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div class="flex-1 overflow-auto">
                <UTable :data="logsList" :columns="tableColumns" :loading="isLoading">
                    <template #logType-cell="{ row }">
                        <UBadge :label="row.original.logType" color="primary" variant="subtle" />
                    </template>

                    <template #requestMethod-cell="{ row }">
                        <UBadge :label="row.original.requestMethod"
                            :color="row.original.requestMethod === 'GET' ? 'blue' : row.original.requestMethod === 'POST' ? 'green' : 'orange'"
                            variant="subtle" />
                    </template>

                    <template #status-cell="{ row }">
                        <UBadge :label="row.original.status === 200 ? '成功' : '失败'"
                            :color="row.original.status === 200 ? 'success' : 'error'" variant="subtle" />
                    </template>

                    <template #actions-cell="{ row }">
                        <UButton icon="i-lucide-eye" label="详情" color="primary" variant="ghost"
                            @click="openDetail(row.original)" />
                    </template>

                    <template #empty>
                        <div class="flex flex-col items-center justify-center py-12">
                            <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mb-2" />
                            <p class="text-gray-500">暂无数据</p>
                        </div>
                    </template>
                </UTable>
            </div>

            <!-- 分页 -->
            <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                <EnhancedPagination
                    v-model:page="pageInfo.current"
                    v-model:items-per-page="pageInfo.size"
                    :total="total"
                    :disabled="isLoading"
                    @page-change="handlePageChange"
                    @size-change="handleSizeChange"
                />
            </div>
        </div>

        <!-- 详情对话框 -->
        <LogsDetail v-model:open="detailDialogVisible" :log-id="selectedLog?.id" />
    </div>
</template>
