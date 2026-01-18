<script setup lang="ts">
import { useLogsManagement } from './composables/useLogsManagement';
import type { ILogs } from '@/services/types/logs';
import LogsDetail from './components/details.vue';

const {
  logsList,
  total,
  isLoading,
  tableColumns,
  pageInfo,
  searchParams,
  updateSearch,
  handlePageChange,
  handleSizeChange,
  refetchLogs,
} = useLogsManagement();

const detailDialogVisible = ref(false);
const selectedLog = ref<ILogs | null>(null);

const openDetail = (log: ILogs) => {
  selectedLog.value = log;
  detailDialogVisible.value = true;
};

const handleSearch = () => {
  updateSearch(searchParams.value);
};

const handleReset = () => {
  searchParams.value = {
    startTime: '',
    endTime: '',
    createBy: '',
    logType: '',
    module: '',
  };
  handleSearch();
};
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <!-- 搜索区域 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-4 gap-4">
        <UFormGroup label="日志类型">
          <UInput v-model="searchParams.logType" placeholder="请输入日志类型" />
        </UFormGroup>
        <UFormGroup label="所属模块">
          <UInput v-model="searchParams.module" placeholder="请输入模块名称" />
        </UFormGroup>
        <UFormGroup label="创建人">
          <UInput v-model="searchParams.createBy" placeholder="请输入创建人" />
        </UFormGroup>
        <div class="flex items-end gap-2">
          <UButton icon="i-lucide-search" label="搜索" @click="handleSearch" />
          <UButton icon="i-lucide-rotate-ccw" label="重置" color="gray" variant="outline" @click="handleReset" />
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-auto">
        <UTable :data="logsList" :columns="tableColumns" :loading="isLoading">
          <template #logType-cell="{ row }">
            <UBadge :label="row.original.logType" color="primary" variant="subtle" />
          </template>

          <template #requestMethod-cell="{ row }">
            <UBadge
              :label="row.original.requestMethod"
              :color="row.original.requestMethod === 'GET' ? 'blue' : row.original.requestMethod === 'POST' ? 'green' : 'orange'"
              variant="subtle"
            />
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :label="row.original.status === 200 ? '成功' : '失败'"
              :color="row.original.status === 200 ? 'success' : 'error'"
              variant="subtle"
            />
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="i-lucide-eye"
              label="详情"
              size="xs"
              color="gray"
              variant="ghost"
              @click="openDetail(row.original)"
            />
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
      <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          共 {{ total }} 条记录
        </div>
        <UPagination
          v-model="pageInfo.current"
          :total="total"
          :page-size="pageInfo.size"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <LogsDetail v-model:open="detailDialogVisible" :log-id="selectedLog?.id" />
  </div>
</template>
