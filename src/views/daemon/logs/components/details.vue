<script setup lang="ts">
import { useLogsDetailQuery } from '@/services/composables/useLogsQuery';
import type { ILogs } from '@/services/types/logs';

const props = defineProps<{
  logId?: string | number;
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const { data: logDetail, isLoading } = useLogsDetailQuery(
  computed(() => props.logId!),
  { enabled: computed(() => isOpen.value && !!props.logId) }
);

const formatJson = (str?: string) => {
  if (!str) return '';
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
};
</script>

<template>
  <UModal v-model:open="isOpen" title="日志详情" :ui="{ content: 'sm:max-w-4xl' }">
    <template #body>
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <div v-else-if="logDetail" class="space-y-4">
        <!-- 基本信息 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">日志类型</label>
            <UBadge :label="logDetail.logType" color="primary" variant="subtle" class="mt-1" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">所属模块</label>
            <p class="mt-1 text-sm">{{ logDetail.module }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求方法</label>
            <UBadge :label="logDetail.requestMethod" color="blue" variant="subtle" class="mt-1" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求IP</label>
            <p class="mt-1 text-sm">{{ logDetail.requestIp }} ({{ logDetail.requestIpAddr }})</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">浏览器</label>
            <p class="mt-1 text-sm">{{ logDetail.browser }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">操作系统</label>
            <p class="mt-1 text-sm">{{ logDetail.os }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">耗时</label>
            <p class="mt-1 text-sm">{{ logDetail.requestTimeConsume }} ms</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">状态</label>
            <UBadge
              :label="logDetail.status === 200 ? '成功' : '失败'"
              :color="logDetail.status === 200 ? 'success' : 'error'"
              variant="subtle"
              class="mt-1"
            />
          </div>
        </div>

        <!-- 请求信息 -->
        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求地址</label>
          <p class="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">{{ logDetail.requestUrl }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求参数</label>
          <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">{{ formatJson(logDetail.requestParam) }}</pre>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求头</label>
          <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">{{ formatJson(logDetail.requestHeader) }}</pre>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">请求体</label>
          <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">{{ formatJson(logDetail.requestBody) }}</pre>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">响应头</label>
          <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">{{ formatJson(logDetail.responseHeader) }}</pre>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">响应体</label>
          <pre class="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-60">{{ formatJson(logDetail.responseBody) }}</pre>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <UButton label="关闭" color="gray" variant="ghost" @click="isOpen = false" />
      </div>
    </template>
  </UModal>
</template>
