<script setup lang="ts">
import { useApiManagement } from './composables/useApiManagement';
import { updateApiCache } from '@/services/modules/api';
import type { IApiParams } from '@/services/types/api';
import { HTTP_METHOD, HttpMethodCN } from '@/global/enums';
import { ApiSearch, ApiSynchronous } from './component';
import { EnhancedPagination } from '@/components/enhanced-pagination';

const {
  apiData,
  total,
  isLoading,
  tableColumns,
  pageInfo,
  fetchApiList,
  updateSearch,
  handlePageChange,
  handleSizeChange,
  resetSearch,
} = useApiManagement();

const toast = useToast();
const apiSynchronousRef = useTemplateRef<typeof ApiSynchronous>('apiSynchronousRef');

const handleSearchEvent = (form: Partial<IApiParams>) => {
  updateSearch(form);
};

const handleResetEvent = () => {
  resetSearch();
};

const handleSynchronousApi = () => {
  apiSynchronousRef.value?.open();
};

const handleRefreshCache = async () => {
  try {
    await updateApiCache();
    toast.add({
      title: '刷新成功',
      color: 'success',
      icon: 'i-lucide-circle-check',
    });
  }
  catch (err) {
    toast.add({
      title: '刷新失败',
      description: err instanceof Error ? err.message : '未知错误',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  }
};

const lookApiDocument = () => {
  window.open('https://xiaolangtou.apifox.cn', '_blank');
};

defineOptions({
  name: 'ApiManagement',
});
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <api-search
      @search="handleSearchEvent"
      @reset="handleResetEvent"
      @sync="handleSynchronousApi"
      @refresh-cache="handleRefreshCache"
      @view-doc="lookApiDocument"
      @refresh="fetchApiList"
    />

    <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">

      <div class="flex-1 overflow-auto">
        <UTable :data="apiData" :columns="tableColumns" :loading="isLoading" :ui="{ divide: 'divide-gray-100 dark:divide-gray-800', tbody: { td: { base: 'border-b border-gray-100 dark:border-gray-800' } } }">
          <template #path-cell="{ row }">
            <span class="font-mono text-sm">{{ row.original.path }}</span>
          </template>

          <template #method-cell="{ row }">
            <UBadge
              v-if="row.original.method"
              :label="`${row.original.method}/${HttpMethodCN[row.original.method as HTTP_METHOD] || ''}`"
              :color="getMethodColor(row.original.method)"
              variant="subtle"
            />
            <span v-else>-</span>
          </template>

          <template #empty>
            <div class="flex flex-col items-center justify-center py-12">
              <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mb-2" />
              <p class="text-gray-500">暂无数据</p>
            </div>
          </template>
        </UTable>
      </div>

      <div class="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
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

    <api-synchronous ref="apiSynchronousRef" @close="fetchApiList" />
  </div>
</template>

<script lang="ts">
function getMethodColor(method?: HTTP_METHOD): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
  if (!method) return 'neutral';

  const colorMap: Partial<Record<HTTP_METHOD, 'primary' | 'success' | 'warning' | 'error'>> = {
    [HTTP_METHOD.GET]: 'success',
    [HTTP_METHOD.POST]: 'primary',
    [HTTP_METHOD.PUT]: 'warning',
    [HTTP_METHOD.DELETE]: 'error',
    [HTTP_METHOD.PATCH]: 'warning',
  };

  return colorMap[method] || 'neutral';
}
</script>
